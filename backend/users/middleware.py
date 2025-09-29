"""
Custom Security Middleware for RioClaro API

Este módulo implementa middleware de seguridad personalizado para:
1. Control de sesiones con timeout
2. Auditoría de logs de seguridad
3. Detección de patrones de ataque
4. Headers de seguridad avanzados
"""

import logging
import time
import json
import re
from datetime import datetime, timedelta
from django.core.cache import cache
from django.http import HttpResponseForbidden, JsonResponse
from django.utils.timezone import now
from django.contrib.auth import logout
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.urls import reverse
from user_agents import parse
import hashlib

# Configurar logger específico para seguridad
security_logger = logging.getLogger('rioclaro.security')


class SessionTimeoutMiddleware(MiddlewareMixin):
    """
    Middleware para manejar timeout de sesiones automáticamente.
    Cierra sesiones después del tiempo configurado de inactividad.
    """

    def process_request(self, request):
        if request.user.is_authenticated:
            current_time = now()
            last_activity = request.session.get('last_activity')

            if last_activity:
                last_activity = datetime.fromisoformat(last_activity)
                timeout_minutes = getattr(
                    settings,
                    'RIOCLARO_SETTINGS', {}
                ).get('SESSION_TIMEOUT_MINUTES', 480)

                if current_time - last_activity > timedelta(minutes=timeout_minutes):
                    security_logger.warning(
                        f"Session timeout for user {request.user.username} "
                        f"from IP {self._get_client_ip(request)}"
                    )
                    logout(request)
                    return JsonResponse({
                        'error': 'Session expired due to inactivity',
                        'code': 'SESSION_TIMEOUT'
                    }, status=401)

            # Actualizar last_activity
            request.session['last_activity'] = current_time.isoformat()

        return None

    def _get_client_ip(self, request):
        """Obtener IP real del cliente considerando proxies"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AuditLogMiddleware(MiddlewareMixin):
    """
    Middleware para auditoría completa de requests y detección de actividad sospechosa.
    Registra intentos de autenticación, accesos a endpoints sensibles y patrones de ataque.
    """

    # Patrones sospechosos comunes
    SUSPICIOUS_PATTERNS = [
        r'(\.\./){3,}',           # Path traversal
        r'<script[^>]*>',         # XSS attempt
        r'union\s+select',        # SQL injection
        r'exec\s*\(',             # Code injection
        r'javascript:',           # JavaScript injection
        r'vbscript:',             # VBScript injection
        r'onload\s*=',           # Event handler injection
        r'onerror\s*=',          # Error handler injection
    ]

    # Endpoints sensibles que requieren auditoría especial
    SENSITIVE_ENDPOINTS = [
        '/api/auth/',
        '/admin/',
        '/api/users/',
        '/api/measurements/module4/',
    ]

    def process_request(self, request):
        # Marcar tiempo de inicio para medir duración
        request._audit_start_time = time.time()

        # Obtener información del request
        client_ip = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        request_data = self._get_request_data(request)

        # Detectar patrones sospechosos
        suspicious_activity = self._detect_suspicious_activity(request, request_data)

        if suspicious_activity:
            security_logger.critical(
                f"SUSPICIOUS ACTIVITY DETECTED: {suspicious_activity} "
                f"from IP {client_ip}, User: {getattr(request.user, 'username', 'Anonymous')}, "
                f"Path: {request.path}, Method: {request.method}, "
                f"User-Agent: {user_agent}"
            )

            # Opcional: bloquear request sospechoso
            if self._should_block_request(suspicious_activity):
                return JsonResponse({
                    'error': 'Request blocked for security reasons',
                    'code': 'SECURITY_BLOCK'
                }, status=403)

        # Rate limiting por IP para requests sospechosos
        if self._check_rate_limit(client_ip, request.path):
            security_logger.warning(
                f"RATE LIMIT EXCEEDED for IP {client_ip} on path {request.path}"
            )
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'code': 'RATE_LIMIT_EXCEEDED'
            }, status=429)

        return None

    def process_response(self, request, response):
        if hasattr(request, '_audit_start_time'):
            duration = time.time() - request._audit_start_time

            # Log para endpoints sensibles o respuestas de error
            if (any(sensitive in request.path for sensitive in self.SENSITIVE_ENDPOINTS) or
                response.status_code >= 400 or
                duration > 5.0):  # Requests lentos

                self._log_request_response(request, response, duration)

        return response

    def process_exception(self, request, exception):
        """Log exceptions para análisis de seguridad"""
        client_ip = self._get_client_ip(request)
        security_logger.error(
            f"EXCEPTION in request from IP {client_ip}: {str(exception)}, "
            f"Path: {request.path}, Method: {request.method}, "
            f"User: {getattr(request.user, 'username', 'Anonymous')}"
        )
        return None

    def _get_client_ip(self, request):
        """Obtener IP real del cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def _get_request_data(self, request):
        """Obtener datos del request de manera segura"""
        try:
            if request.content_type == 'application/json':
                return request.body.decode('utf-8')
            elif hasattr(request, 'POST') and request.POST:
                # No loggear passwords
                data = dict(request.POST)
                if 'password' in data:
                    data['password'] = '[REDACTED]'
                return str(data)
        except:
            pass
        return ''

    def _detect_suspicious_activity(self, request, request_data):
        """Detectar patrones de actividad sospechosa"""
        suspicious_indicators = []

        # Combinar URL, headers y datos para análisis
        full_content = f"{request.path} {request_data} {request.META.get('HTTP_USER_AGENT', '')}"

        # Buscar patrones sospechosos
        for pattern in self.SUSPICIOUS_PATTERNS:
            if re.search(pattern, full_content, re.IGNORECASE):
                suspicious_indicators.append(f"Pattern match: {pattern}")

        # Detectar user agents sospechosos
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if self._is_suspicious_user_agent(user_agent):
            suspicious_indicators.append(f"Suspicious User-Agent: {user_agent[:100]}")

        # Detectar requests con muchos parámetros (posible parameter pollution)
        if len(request.GET) > 20 or len(getattr(request, 'POST', {})) > 20:
            suspicious_indicators.append("Too many parameters")

        # Detectar requests con headers anómalos
        if len(request.META.get('HTTP_USER_AGENT', '')) > 1000:
            suspicious_indicators.append("Abnormally long User-Agent")

        return suspicious_indicators

    def _is_suspicious_user_agent(self, user_agent):
        """Detectar user agents sospechosos"""
        suspicious_ua_patterns = [
            'sqlmap', 'nikto', 'nmap', 'masscan', 'zap', 'burp',
            'python-requests', 'curl', 'wget', 'gobuster',
            'dirb', 'dirbuster', 'wpscan', 'nuclei'
        ]

        ua_lower = user_agent.lower()
        return any(pattern in ua_lower for pattern in suspicious_ua_patterns)

    def _should_block_request(self, suspicious_indicators):
        """Decidir si bloquear un request basado en indicadores sospechosos"""
        # Bloquear si hay patrones de inyección SQL o XSS
        critical_patterns = ['union select', '<script', 'javascript:', 'exec(']
        for indicator in suspicious_indicators:
            if any(pattern in indicator.lower() for pattern in critical_patterns):
                return True
        return False

    def _check_rate_limit(self, ip, path):
        """Rate limiting básico por IP"""
        cache_key = f"rate_limit:{hashlib.md5(ip.encode()).hexdigest()}:{path}"
        current_requests = cache.get(cache_key, 0)

        # Límite: 100 requests por minuto por IP por path
        if current_requests > 100:
            return True

        cache.set(cache_key, current_requests + 1, 60)  # TTL 60 segundos
        return False

    def _log_request_response(self, request, response, duration):
        """Log detallado de request/response"""
        client_ip = self._get_client_ip(request)
        user_agent_parsed = parse(request.META.get('HTTP_USER_AGENT', ''))

        log_data = {
            'timestamp': now().isoformat(),
            'client_ip': client_ip,
            'user': getattr(request.user, 'username', 'Anonymous'),
            'method': request.method,
            'path': request.path,
            'status_code': response.status_code,
            'duration': round(duration, 3),
            'user_agent': {
                'browser': f"{user_agent_parsed.browser.family} {user_agent_parsed.browser.version_string}",
                'os': f"{user_agent_parsed.os.family} {user_agent_parsed.os.version_string}",
                'device': user_agent_parsed.device.family,
            },
            'referer': request.META.get('HTTP_REFERER', ''),
        }

        # Log diferenciado por nivel
        if response.status_code >= 500:
            security_logger.error(f"SERVER_ERROR: {json.dumps(log_data)}")
        elif response.status_code >= 400:
            security_logger.warning(f"CLIENT_ERROR: {json.dumps(log_data)}")
        elif any(sensitive in request.path for sensitive in self.SENSITIVE_ENDPOINTS):
            security_logger.info(f"SENSITIVE_ACCESS: {json.dumps(log_data)}")


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Middleware para añadir headers de seguridad avanzados
    """

    def process_response(self, request, response):
        # Headers de seguridad básicos (algunos ya configurados en settings)
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Content Security Policy para API
        if request.path.startswith('/api/'):
            response['Content-Security-Policy'] = (
                "default-src 'none'; "
                "script-src 'none'; "
                "object-src 'none'; "
                "base-uri 'none'; "
                "frame-ancestors 'none';"
            )

        # Permissions Policy (anteriormente Feature-Policy)
        response['Permissions-Policy'] = (
            'geolocation=(), '
            'microphone=(), '
            'camera=(), '
            'payment=(), '
            'usb=(), '
            'magnetometer=(), '
            'gyroscope=(), '
            'speaker=()'
        )

        # Cache control para endpoints sensibles
        if any(sensitive in request.path for sensitive in ['/api/auth/', '/admin/', '/api/users/']):
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'

        return response


class RequestSanitizationMiddleware(MiddlewareMixin):
    """
    Middleware para sanitización básica de requests
    """

    def process_request(self, request):
        # Sanitizar parámetros GET
        if request.GET:
            sanitized_get = {}
            for key, value in request.GET.items():
                sanitized_get[self._sanitize_string(key)] = self._sanitize_string(value)
            request.GET = sanitized_get

        return None

    def _sanitize_string(self, value):
        """Sanitización básica de strings"""
        if not isinstance(value, str):
            return value

        # Remover caracteres potencialmente peligrosos
        dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\r', '\n']
        for char in dangerous_chars:
            value = value.replace(char, '')

        return value.strip()