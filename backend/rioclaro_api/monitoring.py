"""
Monitoring and metrics endpoints for application observability.
"""

import time
import logging
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Avg
from django.contrib.auth import get_user_model

# Import models
from stations.models import Station
from measurements.models import Measurement, Alert

logger = logging.getLogger(__name__)
User = get_user_model()


@csrf_exempt
@require_http_methods(["GET"])
def metrics(request):
    """
    Application metrics endpoint for monitoring dashboards.
    """
    try:
        # Get time ranges
        now = timezone.now()
        last_hour = now - timedelta(hours=1)
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)

        # Database metrics
        db_metrics = _get_database_metrics()

        # Application metrics
        app_metrics = {
            'users': {
                'total': User.objects.count(),
                'active_last_24h': User.objects.filter(last_login__gte=last_24h).count(),
                'by_role': dict(User.objects.values('role').annotate(count=Count('id')).values_list('role', 'count'))
            },
            'stations': {
                'total': Station.objects.count(),
                'active': Station.objects.filter(is_active=True).count() if hasattr(Station, 'is_active') else Station.objects.count()
            },
            'measurements': {
                'total': Measurement.objects.count(),
                'last_hour': Measurement.objects.filter(timestamp__gte=last_hour).count(),
                'last_24h': Measurement.objects.filter(timestamp__gte=last_24h).count(),
                'last_7d': Measurement.objects.filter(timestamp__gte=last_7d).count(),
                'avg_per_hour_last_24h': _get_avg_measurements_per_hour(last_24h, now)
            },
            'alerts': {
                'total': Alert.objects.count(),
                'active': Alert.objects.filter(status='active').count() if hasattr(Alert, 'status') else 0,
                'last_24h': Alert.objects.filter(created_at__gte=last_24h).count() if hasattr(Alert, 'created_at') else 0
            }
        }

        # Performance metrics
        performance_metrics = {
            'database_query_time_ms': _time_database_query(),
            'cache_hit_rate': _get_cache_hit_rate(),
            'response_time_ms': _get_avg_response_time()
        }

        return JsonResponse({
            'timestamp': now.isoformat(),
            'database': db_metrics,
            'application': app_metrics,
            'performance': performance_metrics
        })

    except Exception as e:
        logger.error(f"Metrics endpoint error: {e}")
        return JsonResponse({
            'error': 'Unable to retrieve metrics',
            'timestamp': timezone.now().isoformat()
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def system_info(request):
    """
    System information endpoint.
    """
    try:
        # Django settings info (safe subset)
        django_info = {
            'version': _get_django_version(),
            'debug': getattr(settings, 'DEBUG', False),
            'environment': getattr(settings, 'DJANGO_ENVIRONMENT', 'unknown'),
            'timezone': str(timezone.get_current_timezone()),
            'language_code': getattr(settings, 'LANGUAGE_CODE', 'unknown')
        }

        # Database info
        db_info = {
            'engine': _get_database_engine(),
            'name': _get_database_name()
        }

        return JsonResponse({
            'timestamp': timezone.now().isoformat(),
            'django': django_info,
            'database': db_info,
            'uptime_seconds': _get_uptime_seconds()
        })

    except Exception as e:
        logger.error(f"System info endpoint error: {e}")
        return JsonResponse({
            'error': 'Unable to retrieve system info',
            'timestamp': timezone.now().isoformat()
        }, status=500)


def _get_database_metrics():
    """Get database connection and query metrics."""
    try:
        with connection.cursor() as cursor:
            # Get database size (for SQLite)
            if 'sqlite' in connection.settings_dict['ENGINE']:
                cursor.execute("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();")
                size_bytes = cursor.fetchone()[0] if cursor.rowcount > 0 else 0
            else:
                size_bytes = None

            # Get connection info
            return {
                'size_bytes': size_bytes,
                'size_mb': round(size_bytes / 1024 / 1024, 2) if size_bytes else None,
                'connections_used': len(connection.queries),
                'engine': connection.settings_dict['ENGINE']
            }
    except Exception as e:
        logger.error(f"Database metrics error: {e}")
        return {'error': str(e)}


def _get_avg_measurements_per_hour(start_time, end_time):
    """Calculate average measurements per hour in the given time range."""
    try:
        total_measurements = Measurement.objects.filter(
            timestamp__gte=start_time,
            timestamp__lte=end_time
        ).count()

        hours = (end_time - start_time).total_seconds() / 3600
        return round(total_measurements / hours, 2) if hours > 0 else 0
    except Exception:
        return 0


def _time_database_query():
    """Time a simple database query and return response time in milliseconds."""
    try:
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        end_time = time.time()
        return round((end_time - start_time) * 1000, 2)
    except Exception:
        return None


def _get_cache_hit_rate():
    """Calculate cache hit rate (simplified metric)."""
    try:
        # This is a simplified implementation
        # In production, you might want to use Redis INFO command
        test_key = 'cache_hit_test'
        cache.set(test_key, 'test', 60)
        hit = cache.get(test_key) is not None
        return 100.0 if hit else 0.0
    except Exception:
        return None


def _get_avg_response_time():
    """Get average response time (placeholder - would need middleware to track)."""
    # This would require implementing a middleware to track response times
    # For now, return a placeholder
    return None


def _get_django_version():
    """Get Django version."""
    try:
        import django
        return django.get_version()
    except Exception:
        return 'unknown'


def _get_database_engine():
    """Get database engine name."""
    try:
        return connection.settings_dict['ENGINE'].split('.')[-1]
    except Exception:
        return 'unknown'


def _get_database_name():
    """Get database name."""
    try:
        return connection.settings_dict['NAME']
    except Exception:
        return 'unknown'


def _get_uptime_seconds():
    """Get application uptime in seconds (placeholder)."""
    # This would require storing startup time somewhere
    # For now, return None
    return None