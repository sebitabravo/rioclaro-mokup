"""
Performance optimization mixins for Django REST Framework ViewSets.
"""

import hashlib
import logging
from django.core.cache import cache
from django.conf import settings
from django.db.models import Prefetch
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


class CacheMixin:
    """
    Mixin to add caching capabilities to ViewSets.
    """
    cache_timeout = 300  # 5 minutes default
    cache_key_prefix = 'api_cache'

    def get_cache_key(self, request, *args, **kwargs):
        """Generate a cache key based on the request parameters."""
        # Include user id for user-specific caching
        user_id = request.user.id if request.user.is_authenticated else 'anon'

        # Include relevant parameters
        params = {
            'view': self.__class__.__name__,
            'action': getattr(self, 'action', 'unknown'),
            'user_id': user_id,
            'args': str(args),
            'kwargs': str(kwargs),
            'query_params': dict(request.query_params)
        }

        # Create a hash of the parameters
        cache_string = str(sorted(params.items()))
        cache_hash = hashlib.md5(cache_string.encode()).hexdigest()

        return f"{self.cache_key_prefix}:{cache_hash}"

    def get_cached_response(self, request, *args, **kwargs):
        """Get response from cache if available."""
        if not getattr(settings, 'USE_CACHE', True):
            return None

        cache_key = self.get_cache_key(request, *args, **kwargs)
        cached_data = cache.get(cache_key)

        if cached_data:
            logger.info(f"Cache hit for key: {cache_key}")
            return Response(cached_data)

        return None

    def set_cached_response(self, request, response_data, *args, **kwargs):
        """Cache the response data."""
        if not getattr(settings, 'USE_CACHE', True):
            return

        cache_key = self.get_cache_key(request, *args, **kwargs)
        timeout = getattr(self, 'cache_timeout', 300)

        try:
            cache.set(cache_key, response_data, timeout)
            logger.info(f"Cached response for key: {cache_key}")
        except Exception as e:
            logger.error(f"Failed to cache response: {e}")

    def invalidate_cache_pattern(self, pattern):
        """Invalidate cache keys matching a pattern."""
        try:
            # This is a simplified implementation
            # In production, you might want to use Redis's pattern deletion
            cache.delete_many([f"{self.cache_key_prefix}:{pattern}"])
        except Exception as e:
            logger.error(f"Failed to invalidate cache pattern {pattern}: {e}")


class OptimizedQueryMixin:
    """
    Mixin to optimize database queries with select_related and prefetch_related.
    """
    select_related_fields = []
    prefetch_related_fields = []

    def get_queryset(self):
        """Override to add query optimizations."""
        queryset = super().get_queryset()

        # Apply select_related for foreign keys
        if self.select_related_fields:
            queryset = queryset.select_related(*self.select_related_fields)

        # Apply prefetch_related for many-to-many and reverse foreign keys
        if self.prefetch_related_fields:
            queryset = queryset.prefetch_related(*self.prefetch_related_fields)

        return queryset


class PerformanceMonitoringMixin:
    """
    Mixin to monitor and log performance metrics.
    """

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to add performance monitoring."""
        import time
        start_time = time.time()

        response = super().dispatch(request, *args, **kwargs)

        end_time = time.time()
        duration = end_time - start_time

        # Log slow requests
        if duration > getattr(settings, 'SLOW_REQUEST_THRESHOLD', 1.0):
            logger.warning(
                f"Slow request detected: {request.method} {request.path} "
                f"took {duration:.2f}s for user {request.user.id if request.user.is_authenticated else 'anonymous'}"
            )

        # Add performance headers in debug mode
        if getattr(settings, 'DEBUG', False):
            response['X-Response-Time'] = f"{duration:.3f}s"

        return response


class BulkOperationMixin:
    """
    Mixin to handle bulk operations efficiently.
    """

    def bulk_create_optimized(self, serializer_class, data_list, batch_size=100):
        """
        Efficiently create multiple objects in batches.
        """
        created_objects = []
        errors = []

        # Process in batches
        for i in range(0, len(data_list), batch_size):
            batch = data_list[i:i + batch_size]

            try:
                # Validate the batch
                serializer = serializer_class(data=batch, many=True)
                if serializer.is_valid():
                    # Use bulk_create for efficiency
                    objects_to_create = [
                        self.get_serializer().Meta.model(**item)
                        for item in serializer.validated_data
                    ]
                    created_batch = self.get_serializer().Meta.model.objects.bulk_create(
                        objects_to_create,
                        ignore_conflicts=True
                    )
                    created_objects.extend(created_batch)
                else:
                    errors.extend(serializer.errors)

            except Exception as e:
                logger.error(f"Bulk create error in batch {i//batch_size + 1}: {e}")
                errors.append(f"Batch {i//batch_size + 1}: {str(e)}")

        return {
            'created_count': len(created_objects),
            'created_objects': created_objects,
            'errors': errors
        }


class RateLimitMixin:
    """
    Mixin to add rate limiting to ViewSets.
    """
    rate_limit_key = None
    rate_limit_requests = 100
    rate_limit_window = 3600  # 1 hour

    def check_rate_limit(self, request):
        """Check if the request exceeds rate limits."""
        if not self.rate_limit_key:
            return True

        # Generate rate limit key
        user_id = request.user.id if request.user.is_authenticated else request.META.get('REMOTE_ADDR')
        limit_key = f"rate_limit:{self.rate_limit_key}:{user_id}"

        # Get current count
        current_count = cache.get(limit_key, 0)

        if current_count >= self.rate_limit_requests:
            return False

        # Increment counter
        cache.set(limit_key, current_count + 1, self.rate_limit_window)
        return True

    def dispatch(self, request, *args, **kwargs):
        """Override dispatch to check rate limits."""
        if not self.check_rate_limit(request):
            return Response(
                {'error': 'Rate limit exceeded. Please try again later.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        return super().dispatch(request, *args, **kwargs)


class ComprehensiveOptimizationMixin(
    CacheMixin,
    OptimizedQueryMixin,
    PerformanceMonitoringMixin,
    BulkOperationMixin,
    RateLimitMixin
):
    """
    Comprehensive mixin that combines all optimization techniques.
    """
    pass