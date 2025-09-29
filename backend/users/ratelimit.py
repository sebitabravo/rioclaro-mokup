"""
Rate Limiting System for RioClaro API

Sistema avanzado de rate limiting con:
1. Límites diferenciados por tipo de endpoint
2. Rate limiting por IP y por usuario
3. Detección de patrones de abuso
4. Integración con django-ratelimit
"""

import hashlib
import time
from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
try:
    from django_ratelimit.decorators import ratelimit
    from django_ratelimit.exceptions import Ratelimited
except ImportError:
    # Fallback si django-ratelimit no está disponible
    def ratelimit(group=None, key=None, rate=None, method=None, block=True):
        def decorator(fn):
            def wrapper(*args, **kwargs):
                return fn(*args, **kwargs)
            return wrapper
        return decorator

    class Ratelimited(Exception):
        pass
import logging

# Logger para rate limiting
rate_logger = logging.getLogger('rioclaro.ratelimit')


class RateLimitConfig:
    """
    Configuración centralizada de rate limits por tipo de endpoint
    """

    # Rate limits por categoría de endpoint
    LIMITS = {
        'authentication': {
            'rate': '5/min',
            'block': True,
            'method': 'POST',
            'key': 'ip'
        },
        'sensitive_api': {
            'rate': '30/min',
            'block': True,
            'method': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            'key': 'ip'
        },
        'public_api': {
            'rate': '100/min',
            'block': False,
            'method': ['GET'],
            'key': 'ip'
        },
        'admin_api': {
            'rate': '20/min',
            'block': True,
            'method': ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            'key': 'user'
        },
        'bulk_operations': {
            'rate': '5/min',
            'block': True,
            'method': ['POST'],
            'key': 'user_or_ip'
        }
    }

    @classmethod
    def get_limit_for_path(cls, path):
        """
        Determinar el tipo de rate limit basado en el path
        """
        if '/auth/' in path or '/login/' in path or '/token/' in path:
            return cls.LIMITS['authentication']
        elif '/admin/' in path:
            return cls.LIMITS['admin_api']
        elif any(sensitive in path for sensitive in ['/users/', '/measurements/module4/']):
            return cls.LIMITS['sensitive_api']
        elif '/bulk/' in path or '/import/' in path or '/export/' in path:
            return cls.LIMITS['bulk_operations']
        else:
            return cls.LIMITS['public_api']


def get_client_identifier(request, key_type='ip'):
    """
    Obtener identificador del cliente para rate limiting
    """
    if key_type == 'ip':
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
        return ip
    elif key_type == 'user':
        if request.user.is_authenticated:
            return f"user_{request.user.id}"
        return get_client_identifier(request, 'ip')
    elif key_type == 'user_or_ip':
        if request.user.is_authenticated:
            return f"user_{request.user.id}"
        return f"ip_{get_client_identifier(request, 'ip')}"
    return 'unknown'


def smart_ratelimit(view_func):
    """
    Decorator inteligente que aplica rate limiting basado en el path
    """
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Obtener configuración para este path
        limit_config = RateLimitConfig.get_limit_for_path(request.path)

        # Aplicar rate limiting usando django-ratelimit
        rate = limit_config['rate']
        method = limit_config['method']
        key = limit_config['key']
        block = limit_config['block']

        # Crear función decorada dinámicamente
        @ratelimit(key=lambda group, request: get_client_identifier(request, key),
                  rate=rate, method=method, block=block)
        def rate_limited_view(request, *args, **kwargs):
            return view_func(request, *args, **kwargs)

        try:
            return rate_limited_view(request, *args, **kwargs)
        except Ratelimited:
            # Log del rate limit
            identifier = get_client_identifier(request, key)
            rate_logger.warning(
                f"Rate limit exceeded for {key} {identifier} on path {request.path}, "
                f"method {request.method}, limit: {rate}"
            )

            return JsonResponse({
                'error': 'Rate limit exceeded',
                'code': 'RATE_LIMIT_EXCEEDED',
                'detail': f'Too many requests. Limit: {rate}',
                'retry_after': 60  # seconds
            }, status=429)

    return wrapper


class AdvancedRateLimiter:
    """
    Sistema avanzado de rate limiting con detección de patrones de abuso
    """

    def __init__(self):
        self.cache_prefix = 'advanced_ratelimit'
        self.abuse_threshold = 10  # Número de violaciones antes de considerar abuso

    def check_advanced_patterns(self, request):
        """
        Detectar patrones avanzados de abuso
        """
        client_ip = get_client_identifier(request, 'ip')
        current_time = int(time.time())

        # Detectar ráfagas de requests
        if self._detect_burst_pattern(client_ip, current_time):
            return self._create_abuse_response('burst_detected')

        # Detectar requests distribuidos sospechosos
        if self._detect_distributed_pattern(request):
            return self._create_abuse_response('distributed_attack')

        # Detectar crawling agresivo
        if self._detect_aggressive_crawling(client_ip, request.path):
            return self._create_abuse_response('aggressive_crawling')

        return None

    def _detect_burst_pattern(self, client_ip, current_time):
        """
        Detectar ráfagas de requests en ventanas de tiempo cortas
        """
        # Ventana de 10 segundos
        window_key = f"{self.cache_prefix}:burst:{client_ip}:{current_time // 10}"
        request_count = cache.get(window_key, 0)

        # Más de 20 requests en 10 segundos es sospechoso
        if request_count > 20:
            rate_logger.warning(f"Burst pattern detected from IP {client_ip}: {request_count} requests in 10s")
            return True

        cache.set(window_key, request_count + 1, 15)  # TTL 15 segundos
        return False

    def _detect_distributed_pattern(self, request):
        """
        Detectar posibles ataques distribuidos basados en user-agent y patrones
        """
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        # User agents sospechosos comunes en ataques
        suspicious_uas = [
            'python-requests', 'curl/', 'wget/', 'Go-http-client',
            'Apache-HttpClient', 'Java/', 'node-fetch'
        ]

        if any(ua in user_agent for ua in suspicious_uas):
            # Contar requests de este tipo de UA
            ua_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8]
            ua_key = f"{self.cache_prefix}:suspicious_ua:{ua_hash}"
            ua_count = cache.get(ua_key, 0)

            if ua_count > 50:  # Más de 50 requests por hora de UA sospechoso
                rate_logger.warning(f"Distributed pattern detected with UA: {user_agent[:50]}")
                return True

            cache.set(ua_key, ua_count + 1, 3600)  # TTL 1 hora

        return False

    def _detect_aggressive_crawling(self, client_ip, path):
        """
        Detectar crawling agresivo de endpoints
        """
        # Contar requests únicos por path
        path_key = f"{self.cache_prefix}:paths:{client_ip}"
        paths_accessed = cache.get(path_key, set())

        if isinstance(paths_accessed, str):  # Compatibilidad
            paths_accessed = set()

        paths_accessed.add(path)

        # Más de 50 paths únicos por hora es crawling agresivo
        if len(paths_accessed) > 50:
            rate_logger.warning(f"Aggressive crawling detected from IP {client_ip}: {len(paths_accessed)} unique paths")
            return True

        cache.set(path_key, paths_accessed, 3600)  # TTL 1 hora
        return False

    def _create_abuse_response(self, abuse_type):
        """
        Crear respuesta para abuso detectado
        """
        return JsonResponse({
            'error': 'Abuse detected',
            'code': 'ABUSE_DETECTED',
            'type': abuse_type,
            'message': 'Your request pattern has been identified as potentially abusive'
        }, status=429)

    def record_violation(self, client_ip, violation_type):
        """
        Registrar violación para tracking de abuso repetido
        """
        violation_key = f"{self.cache_prefix}:violations:{client_ip}"
        violations = cache.get(violation_key, [])

        violations.append({
            'type': violation_type,
            'timestamp': time.time()
        })

        # Mantener solo las últimas 24 horas
        cutoff_time = time.time() - 86400  # 24 horas
        violations = [v for v in violations if v['timestamp'] > cutoff_time]

        cache.set(violation_key, violations, 86400)  # TTL 24 horas

        # Si hay muchas violaciones, considerar bloqueo temporal
        if len(violations) > self.abuse_threshold:
            self._temporary_block(client_ip)

    def _temporary_block(self, client_ip):
        """
        Bloqueo temporal por abuso repetido
        """
        block_key = f"{self.cache_prefix}:blocked:{client_ip}"
        cache.set(block_key, True, 3600)  # Bloquear por 1 hora

        rate_logger.critical(f"Temporary block applied to IP {client_ip} for repeated violations")

    def is_blocked(self, client_ip):
        """
        Verificar si una IP está bloqueada temporalmente
        """
        block_key = f"{self.cache_prefix}:blocked:{client_ip}"
        return cache.get(block_key, False)


# Instancia global del rate limiter avanzado
advanced_rate_limiter = AdvancedRateLimiter()


def check_advanced_rate_limits(request):
    """
    Función para usar en middleware o views para checks avanzados
    """
    client_ip = get_client_identifier(request, 'ip')

    # Verificar si está bloqueado
    if advanced_rate_limiter.is_blocked(client_ip):
        return JsonResponse({
            'error': 'IP temporarily blocked',
            'code': 'IP_BLOCKED',
            'message': 'Your IP has been temporarily blocked due to abuse'
        }, status=403)

    # Verificar patrones avanzados
    return advanced_rate_limiter.check_advanced_patterns(request)


# Decorators específicos para diferentes tipos de endpoints

def auth_ratelimit(view_func):
    """Decorator específico para endpoints de autenticación"""
    return ratelimit(
        key=lambda group, request: get_client_identifier(request, 'ip'),
        rate='5/min',
        method=['POST'],
        block=True
    )(view_func)


def api_ratelimit(view_func):
    """Decorator genérico para APIs"""
    return ratelimit(
        key=lambda group, request: get_client_identifier(request, 'user_or_ip'),
        rate='100/min',
        method=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        block=False
    )(view_func)


def admin_ratelimit(view_func):
    """Decorator para endpoints de admin"""
    return ratelimit(
        key=lambda group, request: get_client_identifier(request, 'user'),
        rate='20/min',
        method=['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        block=True
    )(view_func)