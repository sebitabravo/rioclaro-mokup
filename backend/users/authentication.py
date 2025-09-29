"""
Custom Authentication Backend for RioClaro API

Backend de autenticación personalizado que permite:
1. Login con email o username
2. Validaciones de seguridad adicionales
3. Logging de eventos de autenticación
4. Control de intentos de login fallidos
"""

from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.core.cache import cache
from django.utils.timezone import now
from datetime import timedelta
import logging

User = get_user_model()
logger = logging.getLogger('rioclaro.auth')


class EmailOrUsernameBackend(ModelBackend):
    """
    Backend de autenticación que permite login con email o username
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        # Intentar encontrar usuario por username o email
        try:
            user = User.objects.get(
                Q(username__iexact=username) | Q(email__iexact=username)
            )
        except User.DoesNotExist:
            # Log intento fallido con usuario inexistente
            logger.warning(f"Authentication attempt with non-existent user: {username}")
            return None
        except User.MultipleObjectsReturned:
            # Log problema de múltiples usuarios (no debería pasar)
            logger.error(f"Multiple users found for identifier: {username}")
            return None

        # Verificar contraseña
        if user.check_password(password):
            # Verificaciones adicionales de seguridad
            if not self._additional_security_checks(user, request):
                return None

            # Log login exitoso
            logger.info(f"Successful authentication for user: {user.username}")
            return user
        else:
            # Log intento de contraseña incorrecta
            logger.warning(f"Failed authentication attempt for user: {user.username}")
            self._record_failed_attempt(user, request)
            return None

    def _additional_security_checks(self, user, request):
        """
        Verificaciones adicionales de seguridad antes de permitir login
        """
        # Verificar que el usuario esté activo
        if not user.is_active:
            logger.warning(f"Authentication denied for inactive user: {user.username}")
            return False

        # Verificar si la cuenta está temporalmente bloqueada
        if self._is_account_locked(user):
            logger.warning(f"Authentication denied for locked account: {user.username}")
            return False

        # Verificar patrones de login sospechosos
        if self._detect_suspicious_login(user, request):
            logger.warning(f"Suspicious login pattern detected for user: {user.username}")
            return False

        return True

    def _is_account_locked(self, user):
        """
        Verificar si la cuenta está temporalmente bloqueada por intentos fallidos
        """
        cache_key = f"failed_attempts:{user.id}"
        failed_attempts = cache.get(cache_key, 0)

        # Bloquear después de 5 intentos fallidos
        return failed_attempts >= 5

    def _record_failed_attempt(self, user, request):
        """
        Registrar intento fallido y aplicar bloqueo temporal si es necesario
        """
        cache_key = f"failed_attempts:{user.id}"
        failed_attempts = cache.get(cache_key, 0) + 1

        # Bloquear por 30 minutos después de 5 intentos
        if failed_attempts >= 5:
            cache.set(cache_key, failed_attempts, 1800)  # 30 minutos
            logger.error(f"Account temporarily locked for user: {user.username} after {failed_attempts} failed attempts")
        else:
            cache.set(cache_key, failed_attempts, 300)  # 5 minutos para intentos menores

        # Log del intento fallido con contexto
        ip_address = self._get_client_ip(request) if request else 'unknown'
        logger.warning(
            f"Failed login attempt #{failed_attempts} for user {user.username} from IP {ip_address}"
        )

    def _detect_suspicious_login(self, user, request):
        """
        Detectar patrones de login sospechosos
        """
        if not request:
            return False

        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # Verificar múltiples IPs en poco tiempo
        if self._check_multiple_ips(user, ip_address):
            return True

        # Verificar user agent sospechoso
        if self._is_suspicious_user_agent(user_agent):
            return True

        return False

    def _check_multiple_ips(self, user, current_ip):
        """
        Verificar si el usuario está usando múltiples IPs en poco tiempo
        """
        cache_key = f"user_ips:{user.id}"
        recent_ips = cache.get(cache_key, set())

        if isinstance(recent_ips, str):  # Compatibilidad con cache
            recent_ips = {recent_ips}
        elif not isinstance(recent_ips, set):
            recent_ips = set(recent_ips) if recent_ips else set()

        recent_ips.add(current_ip)

        # Más de 3 IPs diferentes en 1 hora es sospechoso
        if len(recent_ips) > 3:
            logger.warning(f"Multiple IP addresses detected for user {user.username}: {recent_ips}")
            return True

        cache.set(cache_key, recent_ips, 3600)  # 1 hora
        return False

    def _is_suspicious_user_agent(self, user_agent):
        """
        Detectar user agents sospechosos
        """
        suspicious_patterns = [
            'python-requests', 'curl/', 'wget/', 'scanner', 'bot',
            'crawler', 'spider', 'automated'
        ]

        ua_lower = user_agent.lower()
        return any(pattern in ua_lower for pattern in suspicious_patterns)

    def _get_client_ip(self, request):
        """
        Obtener IP real del cliente
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_user(self, user_id):
        """
        Obtener usuario por ID (requerido por Django)
        """
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None