"""
Custom Validators for RioClaro API Security

Este módulo implementa validadores personalizados para:
1. Políticas de contraseñas robustas
2. Validación de entrada de datos
3. Sanitización de archivos
4. Validación de emails y usernames
"""

import re
import string
import hashlib
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
# BasePasswordValidator not available in this Django version
from django.utils.translation import gettext as _
from django.conf import settings
from django.core.validators import EmailValidator as DjangoEmailValidator
import bleach
import validators


class CustomPasswordValidator:
    """
    Validador personalizado de contraseñas con políticas robustas
    """

    def __init__(self):
        self.policy = getattr(settings, 'RIOCLARO_SETTINGS', {}).get('PASSWORD_POLICY', {})
        self.min_length = self.policy.get('MIN_LENGTH', 8)
        self.require_uppercase = self.policy.get('REQUIRE_UPPERCASE', True)
        self.require_lowercase = self.policy.get('REQUIRE_LOWERCASE', True)
        self.require_numbers = self.policy.get('REQUIRE_NUMBERS', True)
        self.require_symbols = self.policy.get('REQUIRE_SYMBOLS', False)

    def validate(self, password, user=None):
        errors = []

        # Longitud mínima
        if len(password) < self.min_length:
            errors.append(
                ValidationError(
                    _(f"Password must be at least {self.min_length} characters long."),
                    code='password_too_short',
                )
            )

        # Mayúsculas requeridas
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one uppercase letter."),
                    code='password_no_uppercase',
                )
            )

        # Minúsculas requeridas
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one lowercase letter."),
                    code='password_no_lowercase',
                )
            )

        # Números requeridos
        if self.require_numbers and not re.search(r'[0-9]', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one number."),
                    code='password_no_number',
                )
            )

        # Símbolos requeridos
        if self.require_symbols and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append(
                ValidationError(
                    _("Password must contain at least one special character."),
                    code='password_no_symbol',
                )
            )

        # Patrones comunes débiles
        weak_patterns = [
            r'123456',
            r'password',
            r'qwerty',
            r'admin',
            r'test',
            r'(\w)\1{2,}',  # Caracteres repetidos
        ]

        for pattern in weak_patterns:
            if re.search(pattern, password.lower()):
                errors.append(
                    ValidationError(
                        _("Password contains common weak patterns."),
                        code='password_too_common',
                    )
                )
                break

        # Verificar que no sea similar al username o email
        if user:
            if hasattr(user, 'username') and user.username:
                if password.lower() in user.username.lower() or user.username.lower() in password.lower():
                    errors.append(
                        ValidationError(
                            _("Password cannot be similar to username."),
                            code='password_too_similar',
                        )
                    )

            if hasattr(user, 'email') and user.email:
                email_parts = user.email.split('@')[0].lower()
                if password.lower() in email_parts or email_parts in password.lower():
                    errors.append(
                        ValidationError(
                            _("Password cannot be similar to email address."),
                            code='password_too_similar',
                        )
                    )

        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        requirements = [f"at least {self.min_length} characters"]

        if self.require_uppercase:
            requirements.append("at least one uppercase letter")
        if self.require_lowercase:
            requirements.append("at least one lowercase letter")
        if self.require_numbers:
            requirements.append("at least one number")
        if self.require_symbols:
            requirements.append("at least one special character")

        return _("Your password must contain " + ", ".join(requirements) + ".")


class EnhancedEmailValidator(DjangoEmailValidator):
    """
    Validador de email mejorado con verificaciones adicionales de seguridad
    """

    # Dominios sospechosos conocidos
    SUSPICIOUS_DOMAINS = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'temp-mail.org'
    ]

    def __call__(self, value):
        # Validación básica de Django
        super().__call__(value)

        # Verificaciones adicionales
        email_lower = value.lower().strip()
        domain = email_lower.split('@')[1] if '@' in email_lower else ''

        # Verificar dominios sospechosos
        if domain in self.SUSPICIOUS_DOMAINS:
            raise ValidationError(
                _("Email from temporary/suspicious domain not allowed."),
                code='suspicious_email_domain',
            )

        # Verificar longitud razonable
        if len(value) > 254:  # RFC 5321 limit
            raise ValidationError(
                _("Email address too long."),
                code='email_too_long',
            )

        # Verificar caracteres sospechosos
        if re.search(r'[<>"\']', value):
            raise ValidationError(
                _("Email contains invalid characters."),
                code='email_invalid_chars',
            )


class UsernameValidator:
    """
    Validador personalizado para usernames
    """

    def __call__(self, value):
        # Longitud
        if len(value) < 3 or len(value) > 30:
            raise ValidationError(
                _("Username must be between 3 and 30 characters long."),
                code='username_invalid_length',
            )

        # Solo caracteres alfanuméricos y guiones bajos
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise ValidationError(
                _("Username can only contain letters, numbers, and underscores."),
                code='username_invalid_chars',
            )

        # No puede empezar con número
        if value[0].isdigit():
            raise ValidationError(
                _("Username cannot start with a number."),
                code='username_starts_with_number',
            )

        # Palabras reservadas
        reserved_words = [
            'admin', 'root', 'administrator', 'test', 'user', 'guest',
            'api', 'www', 'mail', 'email', 'support', 'info', 'null',
            'undefined', 'system', 'operator', 'moderator'
        ]

        if value.lower() in reserved_words:
            raise ValidationError(
                _("Username cannot be a reserved word."),
                code='username_reserved',
            )


class InputSanitizer:
    """
    Clase para sanitización de entrada de datos
    """

    @staticmethod
    def sanitize_html(value):
        """
        Sanitizar HTML eliminando tags peligrosos
        """
        if not isinstance(value, str):
            return value

        # Tags permitidos muy limitados para API
        allowed_tags = []
        allowed_attributes = {}

        return bleach.clean(
            value,
            tags=allowed_tags,
            attributes=allowed_attributes,
            strip=True
        )

    @staticmethod
    def sanitize_sql_keywords(value):
        """
        Detectar y neutralizar keywords SQL sospechosos
        """
        if not isinstance(value, str):
            return value

        sql_keywords = [
            'union', 'select', 'insert', 'update', 'delete', 'drop',
            'create', 'alter', 'exec', 'execute', 'script', 'declare'
        ]

        value_lower = value.lower()
        for keyword in sql_keywords:
            if keyword in value_lower:
                # En lugar de bloquear, podemos escapar o registrar
                raise ValidationError(
                    f"Input contains potentially dangerous SQL keyword: {keyword}",
                    code='dangerous_sql_keyword'
                )

        return value

    @staticmethod
    def sanitize_file_path(value):
        """
        Sanitizar paths de archivos para prevenir path traversal
        """
        if not isinstance(value, str):
            return value

        # Remover secuencias de path traversal
        dangerous_patterns = ['../', '..\\', './', '.\\']
        for pattern in dangerous_patterns:
            value = value.replace(pattern, '')

        # Remover caracteres peligrosos para paths
        dangerous_chars = ['<', '>', ':', '"', '|', '?', '*', '\x00']
        for char in dangerous_chars:
            value = value.replace(char, '')

        return value.strip()


class APIParameterValidator:
    """
    Validador para parámetros de API
    """

    @staticmethod
    def validate_pagination_params(page, page_size):
        """
        Validar parámetros de paginación
        """
        if page is not None:
            try:
                page = int(page)
                if page < 1:
                    raise ValidationError("Page number must be positive")
                if page > 10000:  # Límite razonable
                    raise ValidationError("Page number too large")
            except (ValueError, TypeError):
                raise ValidationError("Invalid page number")

        if page_size is not None:
            try:
                page_size = int(page_size)
                if page_size < 1:
                    raise ValidationError("Page size must be positive")
                if page_size > 1000:  # Límite para prevenir DoS
                    raise ValidationError("Page size too large")
            except (ValueError, TypeError):
                raise ValidationError("Invalid page size")

        return page, page_size

    @staticmethod
    def validate_search_query(query):
        """
        Validar queries de búsqueda
        """
        if not isinstance(query, str):
            raise ValidationError("Search query must be a string")

        if len(query) > 500:
            raise ValidationError("Search query too long")

        # Buscar patrones sospechosos
        suspicious_patterns = [
            r'union\s+select',
            r'<script',
            r'javascript:',
            r'vbscript:',
        ]

        query_lower = query.lower()
        for pattern in suspicious_patterns:
            if re.search(pattern, query_lower):
                raise ValidationError("Search query contains suspicious patterns")

        return InputSanitizer.sanitize_html(query)

    @staticmethod
    def validate_date_range(start_date, end_date):
        """
        Validar rangos de fechas
        """
        if start_date and end_date:
            try:
                start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

                if start > end:
                    raise ValidationError("Start date cannot be after end date")

                # Límite razonable de rango (ej: 10 años)
                if (end - start).days > 3650:
                    raise ValidationError("Date range too large")

            except ValueError:
                raise ValidationError("Invalid date format")

        return start_date, end_date


def validate_json_field(value):
    """
    Validador para campos JSON
    """
    if isinstance(value, str):
        try:
            import json
            json.loads(value)
        except json.JSONDecodeError:
            raise ValidationError("Invalid JSON format")

    # Verificar tamaño razonable
    if isinstance(value, str) and len(value) > 100000:  # 100KB
        raise ValidationError("JSON data too large")

    return value


def validate_measurement_value(value):
    """
    Validador específico para valores de medición
    """
    try:
        float_value = float(value)

        # Rangos razonables para mediciones de río
        if float_value < -1000 or float_value > 1000:
            raise ValidationError("Measurement value out of reasonable range")

        return float_value

    except (ValueError, TypeError):
        raise ValidationError("Invalid measurement value")


def validate_coordinates(lat, lon):
    """
    Validar coordenadas geográficas
    """
    try:
        lat = float(lat)
        lon = float(lon)

        if not (-90 <= lat <= 90):
            raise ValidationError("Invalid latitude value")

        if not (-180 <= lon <= 180):
            raise ValidationError("Invalid longitude value")

        return lat, lon

    except (ValueError, TypeError):
        raise ValidationError("Invalid coordinate format")