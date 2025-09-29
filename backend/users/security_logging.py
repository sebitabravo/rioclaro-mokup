"""
Advanced Security Logging System for RioClaro API

Sistema avanzado de logging de seguridad que incluye:
1. Logging estructurado de eventos de seguridad
2. Detección y logging de actividad sospechosa
3. Rotación automática de logs
4. Formateo JSON para análisis automatizado
5. Integración con SIEM systems
"""

import logging
import json
import os
import hashlib
from datetime import datetime, timedelta
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from django.conf import settings
from django.utils.timezone import now
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.contrib.admin.models import LogEntry
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import threading

# Thread-local storage for request context
_local = threading.local()


class SecurityEventTypes:
    """
    Constantes para tipos de eventos de seguridad
    """
    # Autenticación
    LOGIN_SUCCESS = 'login_success'
    LOGIN_FAILED = 'login_failed'
    LOGOUT = 'logout'
    SESSION_EXPIRED = 'session_expired'
    PASSWORD_CHANGED = 'password_changed'

    # Acceso a datos
    SENSITIVE_DATA_ACCESS = 'sensitive_data_access'
    BULK_DATA_EXPORT = 'bulk_data_export'
    ADMIN_ACCESS = 'admin_access'
    API_KEY_USED = 'api_key_used'

    # Actividad sospechosa
    SUSPICIOUS_REQUEST = 'suspicious_request'
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded'
    SQL_INJECTION_ATTEMPT = 'sql_injection_attempt'
    XSS_ATTEMPT = 'xss_attempt'
    PATH_TRAVERSAL_ATTEMPT = 'path_traversal_attempt'
    BRUTE_FORCE_ATTEMPT = 'brute_force_attempt'

    # Errores de sistema
    SYSTEM_ERROR = 'system_error'
    PERMISSION_DENIED = 'permission_denied'
    INVALID_TOKEN = 'invalid_token'

    # Cambios de configuración
    SETTINGS_CHANGED = 'settings_changed'
    USER_CREATED = 'user_created'
    USER_DELETED = 'user_deleted'
    PERMISSIONS_CHANGED = 'permissions_changed'


class SecurityLogFormatter(logging.Formatter):
    """
    Formateador personalizado para logs de seguridad en formato JSON
    """

    def format(self, record):
        # Crear estructura base del log
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'event_type': getattr(record, 'event_type', 'unknown'),
            'message': record.getMessage(),
            'logger': record.name,
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        # Añadir contexto de request si está disponible
        if hasattr(_local, 'request_context'):
            log_entry['request'] = _local.request_context

        # Añadir datos específicos del evento
        if hasattr(record, 'extra_data'):
            log_entry['data'] = record.extra_data

        # Añadir severidad basada en el tipo de evento
        log_entry['severity'] = self._get_severity(getattr(record, 'event_type', None))

        return json.dumps(log_entry, ensure_ascii=False, default=str)

    def _get_severity(self, event_type):
        """
        Determinar severidad basada en el tipo de evento
        """
        critical_events = [
            SecurityEventTypes.SQL_INJECTION_ATTEMPT,
            SecurityEventTypes.BRUTE_FORCE_ATTEMPT,
            SecurityEventTypes.SYSTEM_ERROR,
        ]

        high_events = [
            SecurityEventTypes.SUSPICIOUS_REQUEST,
            SecurityEventTypes.XSS_ATTEMPT,
            SecurityEventTypes.PATH_TRAVERSAL_ATTEMPT,
            SecurityEventTypes.BULK_DATA_EXPORT,
        ]

        medium_events = [
            SecurityEventTypes.LOGIN_FAILED,
            SecurityEventTypes.RATE_LIMIT_EXCEEDED,
            SecurityEventTypes.PERMISSION_DENIED,
        ]

        if event_type in critical_events:
            return 'CRITICAL'
        elif event_type in high_events:
            return 'HIGH'
        elif event_type in medium_events:
            return 'MEDIUM'
        else:
            return 'LOW'


class SecurityLogger:
    """
    Logger especializado para eventos de seguridad
    """

    def __init__(self):
        self.logger = logging.getLogger('rioclaro.security')
        self._setup_handlers()

    def _setup_handlers(self):
        """
        Configurar handlers para diferentes tipos de logs de seguridad
        """
        # Handler para logs generales de seguridad
        security_log_path = os.path.join(settings.BASE_DIR, 'logs', 'security.log')
        os.makedirs(os.path.dirname(security_log_path), exist_ok=True)

        security_handler = RotatingFileHandler(
            security_log_path,
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=10
        )
        security_handler.setFormatter(SecurityLogFormatter())
        security_handler.setLevel(logging.INFO)

        # Handler para eventos críticos
        critical_log_path = os.path.join(settings.BASE_DIR, 'logs', 'security_critical.log')
        critical_handler = RotatingFileHandler(
            critical_log_path,
            maxBytes=5 * 1024 * 1024,  # 5MB
            backupCount=20
        )
        critical_handler.setFormatter(SecurityLogFormatter())
        critical_handler.setLevel(logging.ERROR)

        # Handler para logs diarios de audit
        audit_log_path = os.path.join(settings.BASE_DIR, 'logs', 'audit.log')
        audit_handler = TimedRotatingFileHandler(
            audit_log_path,
            when='midnight',
            interval=1,
            backupCount=365  # Mantener un año de logs
        )
        audit_handler.setFormatter(SecurityLogFormatter())
        audit_handler.setLevel(logging.INFO)

        # Añadir handlers al logger
        self.logger.addHandler(security_handler)
        self.logger.addHandler(critical_handler)
        self.logger.addHandler(audit_handler)
        self.logger.setLevel(logging.INFO)

    def log_security_event(self, event_type, message, level=logging.INFO, **extra_data):
        """
        Log de evento de seguridad con contexto completo
        """
        # Crear record personalizado
        record = self.logger.makeRecord(
            self.logger.name,
            level,
            __file__,
            0,
            message,
            args=(),
            exc_info=None,
            func=None,
            extra={
                'event_type': event_type,
                'extra_data': extra_data
            }
        )

        self.logger.handle(record)

    def log_authentication_event(self, event_type, user=None, ip_address=None, user_agent=None, success=True):
        """
        Log específico para eventos de autenticación
        """
        extra_data = {
            'user': str(user) if user else None,
            'user_id': user.id if user and hasattr(user, 'id') else None,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'success': success,
        }

        message = f"Authentication event: {event_type}"
        if user:
            message += f" for user {user.username}"
        if ip_address:
            message += f" from IP {ip_address}"

        level = logging.INFO if success else logging.WARNING
        self.log_security_event(event_type, message, level, **extra_data)

    def log_suspicious_activity(self, activity_type, details, ip_address=None, user=None, severity='HIGH'):
        """
        Log para actividad sospechosa detectada
        """
        extra_data = {
            'activity_type': activity_type,
            'details': details,
            'ip_address': ip_address,
            'user': str(user) if user else None,
            'severity': severity,
            'requires_investigation': True,
        }

        message = f"SUSPICIOUS ACTIVITY: {activity_type}"
        if isinstance(details, dict):
            message += f" - {json.dumps(details, default=str)}"
        else:
            message += f" - {details}"

        level = logging.ERROR if severity in ['CRITICAL', 'HIGH'] else logging.WARNING
        self.log_security_event(SecurityEventTypes.SUSPICIOUS_REQUEST, message, level, **extra_data)

    def log_data_access(self, endpoint, user, data_type, record_count=None, ip_address=None):
        """
        Log para acceso a datos sensibles
        """
        extra_data = {
            'endpoint': endpoint,
            'user': str(user),
            'user_id': user.id if hasattr(user, 'id') else None,
            'data_type': data_type,
            'record_count': record_count,
            'ip_address': ip_address,
        }

        message = f"Data access: {data_type} via {endpoint} by user {user.username}"
        if record_count:
            message += f" ({record_count} records)"

        self.log_security_event(SecurityEventTypes.SENSITIVE_DATA_ACCESS, message, logging.INFO, **extra_data)

    def log_system_event(self, event_type, message, **extra_data):
        """
        Log para eventos del sistema
        """
        self.log_security_event(event_type, message, logging.INFO, **extra_data)


# Instancia global del security logger
security_logger = SecurityLogger()


class RequestContextMiddleware:
    """
    Middleware para capturar contexto de request para logging
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Capturar contexto del request
        self._set_request_context(request)

        try:
            response = self.get_response(request)
            return response
        finally:
            # Limpiar contexto
            if hasattr(_local, 'request_context'):
                delattr(_local, 'request_context')

    def _set_request_context(self, request):
        """
        Establecer contexto del request en thread-local storage
        """
        context = {
            'method': request.method,
            'path': request.path,
            'ip_address': self._get_client_ip(request),
            'user': str(request.user) if request.user.is_authenticated else 'Anonymous',
            'user_agent': request.META.get('HTTP_USER_AGENT', '')[:500],  # Truncar UA largos
            'content_type': request.content_type,
            'query_params': dict(request.GET) if request.GET else {},
        }

        # Hash del request para correlación
        context_str = f"{request.method}:{request.path}:{context['ip_address']}"
        context['request_hash'] = hashlib.md5(context_str.encode()).hexdigest()[:8]

        _local.request_context = context

    def _get_client_ip(self, request):
        """Obtener IP real del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Handlers para signals de Django
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Log successful login"""
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')

    security_logger.log_authentication_event(
        SecurityEventTypes.LOGIN_SUCCESS,
        user=user,
        ip_address=ip_address,
        user_agent=user_agent,
        success=True
    )


@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """Log user logout"""
    if user:
        ip_address = request.META.get('REMOTE_ADDR')
        security_logger.log_authentication_event(
            SecurityEventTypes.LOGOUT,
            user=user,
            ip_address=ip_address,
            success=True
        )


@receiver(user_login_failed)
def log_user_login_failed(sender, credentials, request, **kwargs):
    """Log failed login attempt"""
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')

    # Intentar obtener username de las credenciales
    username = credentials.get('username', 'unknown')

    security_logger.log_authentication_event(
        SecurityEventTypes.LOGIN_FAILED,
        user=None,  # No hay usuario en login fallido
        ip_address=ip_address,
        user_agent=user_agent,
        success=False
    )

    # Log adicional con detalles del intento
    security_logger.log_security_event(
        SecurityEventTypes.LOGIN_FAILED,
        f"Login failed for username: {username}",
        logging.WARNING,
        username=username,
        ip_address=ip_address,
        user_agent=user_agent
    )


def log_admin_action(user, action, obj=None, change_message=''):
    """
    Log para acciones de admin
    """
    extra_data = {
        'admin_user': str(user),
        'action': action,
        'object': str(obj) if obj else None,
        'object_type': obj.__class__.__name__ if obj else None,
        'change_message': change_message,
    }

    message = f"Admin action: {action}"
    if obj:
        message += f" on {obj.__class__.__name__}: {str(obj)}"

    security_logger.log_security_event(
        SecurityEventTypes.ADMIN_ACCESS,
        message,
        logging.INFO,
        **extra_data
    )


# Función helper para logging manual
def log_security_event(event_type, message, level=logging.INFO, **extra_data):
    """
    Helper function para logging manual de eventos de seguridad
    """
    security_logger.log_security_event(event_type, message, level, **extra_data)


def log_lockout_event(request, username, ip_address):
    """
    Callback para django-axes cuando ocurre un lockout
    """
    security_logger.log_security_event(
        SecurityEventTypes.BRUTE_FORCE_ATTEMPT,
        f"Account locked out due to brute force attempts: {username}",
        logging.CRITICAL,
        username=username,
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
        lockout_reason='brute_force_protection'
    )