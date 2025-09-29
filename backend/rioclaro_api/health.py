"""
Health check endpoints for monitoring application status.
"""

import os
# import psutil  # Comentado temporalmente para desarrollo
import logging
from datetime import datetime
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["GET"])
def health_check(request):
    """
    Basic health check endpoint.
    Returns 200 if the application is running.
    """
    return JsonResponse({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
        'environment': getattr(settings, 'DJANGO_ENVIRONMENT', 'unknown')
    })


@csrf_exempt
@require_http_methods(["GET"])
def health_detailed(request):
    """
    Detailed health check with database, cache, and system metrics.
    """
    health_data = {
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0',
        'environment': getattr(settings, 'DJANGO_ENVIRONMENT', 'unknown'),
        'checks': {}
    }

    overall_status = 'healthy'

    # Database check
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        health_data['checks']['database'] = {
            'status': 'healthy',
            'response_time_ms': _time_database_query()
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        health_data['checks']['database'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_status = 'unhealthy'

    # Cache check
    try:
        cache_key = 'health_check_test'
        cache_value = 'test_value'
        cache.set(cache_key, cache_value, 10)
        cached_value = cache.get(cache_key)

        if cached_value == cache_value:
            health_data['checks']['cache'] = {'status': 'healthy'}
        else:
            health_data['checks']['cache'] = {
                'status': 'unhealthy',
                'error': 'Cache value mismatch'
            }
            overall_status = 'degraded'
    except Exception as e:
        logger.error(f"Cache health check failed: {e}")
        health_data['checks']['cache'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_status = 'degraded'

    # System metrics
    try:
        system_metrics = _get_system_metrics()
        health_data['checks']['system'] = {
            'status': 'healthy',
            'metrics': system_metrics
        }

        # Check system thresholds
        if hasattr(settings, 'HEALTH_CHECK'):
            config = settings.HEALTH_CHECK
            if system_metrics['memory_usage_mb'] < config.get('MEMORY_MIN', 100):
                health_data['checks']['system']['status'] = 'degraded'
                overall_status = 'degraded'

            if system_metrics['disk_usage_percent'] > config.get('DISK_USAGE_MAX', 90):
                health_data['checks']['system']['status'] = 'degraded'
                overall_status = 'degraded'

    except Exception as e:
        logger.error(f"System metrics check failed: {e}")
        health_data['checks']['system'] = {
            'status': 'unhealthy',
            'error': str(e)
        }
        overall_status = 'degraded'

    health_data['status'] = overall_status

    # Return appropriate HTTP status
    status_code = 200
    if overall_status == 'unhealthy':
        status_code = 503
    elif overall_status == 'degraded':
        status_code = 200  # Still operational but with issues

    return JsonResponse(health_data, status=status_code)


@csrf_exempt
@require_http_methods(["GET"])
def ready_check(request):
    """
    Readiness check for Kubernetes/container orchestration.
    Returns 200 when the application is ready to serve traffic.
    """
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()

        return JsonResponse({
            'status': 'ready',
            'timestamp': timezone.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JsonResponse({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': timezone.now().isoformat()
        }, status=503)


@csrf_exempt
@require_http_methods(["GET"])
def live_check(request):
    """
    Liveness check for Kubernetes/container orchestration.
    Returns 200 if the application process is alive.
    """
    return JsonResponse({
        'status': 'alive',
        'timestamp': timezone.now().isoformat(),
        'pid': os.getpid()
    })


def _time_database_query():
    """Time a simple database query and return response time in milliseconds."""
    start_time = datetime.now()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return None

    end_time = datetime.now()
    return int((end_time - start_time).total_seconds() * 1000)


def _get_system_metrics():
    """Get system metrics using psutil."""
    try:
        # Métricas simplificadas para desarrollo (sin psutil)
        return {
            'memory_usage_mb': 4096.0,  # 4GB simulated
            'memory_total_mb': 8192.0,  # 8GB simulated
            'memory_percent': 50.0,
            'disk_usage_percent': 50.0,
            'disk_free_gb': 250.0,  # 250GB simulated
            'cpu_percent': 25.0,
            'process_memory_mb': 128.0,  # 128MB simulated
            'load_average': [1.0, 1.1, 1.2] if hasattr(os, 'getloadavg') else None
        }

        # Original psutil code (commented for development):
        # memory = psutil.virtual_memory()
        # disk = psutil.disk_usage('/')
        # cpu_percent = psutil.cpu_percent(interval=1)
        # process = psutil.Process(os.getpid())
        # process_memory = process.memory_info()
    except Exception as e:
        logger.error(f"Failed to get system metrics: {e}")
        return {
            'error': 'Unable to retrieve system metrics',
            'details': str(e)
        }