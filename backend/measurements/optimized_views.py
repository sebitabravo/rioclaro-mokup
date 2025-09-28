"""
Optimized ViewSets for measurements with caching and performance improvements.
"""

import logging
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Avg, Min, Max, Count, F
from django.core.cache import cache
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from rioclaro_api.mixins import ComprehensiveOptimizationMixin
from .models import Measurement, Station, Alert, Threshold
from .serializers import (
    MeasurementListSerializer,
    MeasurementDetailSerializer,
    AlertSerializer,
    ThresholdSerializer
)
from users.models import UserRole

logger = logging.getLogger(__name__)


class OptimizedMeasurementViewSet(ComprehensiveOptimizationMixin, viewsets.ModelViewSet):
    """
    Optimized ViewSet for measurements with caching and performance enhancements.
    """
    serializer_class = MeasurementListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['station', 'measurement_type', 'timestamp']

    # Optimization settings
    select_related_fields = ['station', 'sensor']
    cache_timeout = 300  # 5 minutes
    rate_limit_key = 'measurements'
    rate_limit_requests = 200
    rate_limit_window = 3600

    def get_queryset(self):
        """Optimized queryset with proper filtering and permissions."""
        queryset = Measurement.objects.all()

        # Apply user permissions
        if self.request.user.role != UserRole.ADMIN:
            # Filter to only stations assigned to the user
            assigned_stations = self.request.user.assigned_stations.all()
            queryset = queryset.filter(station__in=assigned_stations)

        # Apply query optimizations
        queryset = queryset.select_related(*self.select_related_fields)

        # Order by timestamp for consistent pagination
        return queryset.order_by('-timestamp')

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve':
            return MeasurementDetailSerializer
        return MeasurementListSerializer

    def list(self, request, *args, **kwargs):
        """Cached list with pagination."""
        # Check cache first
        cached_response = self.get_cached_response(request, *args, **kwargs)
        if cached_response:
            return cached_response

        # Get paginated response
        response = super().list(request, *args, **kwargs)

        # Cache the response
        if response.status_code == 200:
            self.set_cached_response(request, response.data, *args, **kwargs)

        return response

    @action(detail=False, methods=['get'])
    def latest_by_station(self, request):
        """Get latest measurements grouped by station."""
        cache_key = f"latest_measurements:{request.user.id}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        # Get user's stations
        if request.user.role == UserRole.ADMIN:
            stations = Station.objects.filter(is_active=True)
        else:
            stations = request.user.assigned_stations.filter(is_active=True)

        latest_data = []
        for station in stations:
            latest_measurement = Measurement.objects.filter(
                station=station
            ).select_related('station', 'sensor').order_by('-timestamp').first()

            if latest_measurement:
                serializer = MeasurementDetailSerializer(latest_measurement)
                latest_data.append(serializer.data)

        # Cache for 2 minutes (real-time data)
        cache.set(cache_key, latest_data, 120)
        return Response(latest_data)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get measurement statistics with caching."""
        station_id = request.query_params.get('station_id')
        measurement_type = request.query_params.get('measurement_type')
        days = int(request.query_params.get('days', 7))

        cache_key = f"stats:{request.user.id}:{station_id}:{measurement_type}:{days}"
        cached_stats = cache.get(cache_key)

        if cached_stats:
            return Response(cached_stats)

        # Calculate date range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=days)

        # Build query
        queryset = self.get_queryset().filter(
            timestamp__gte=start_date,
            timestamp__lte=end_date
        )

        if station_id:
            queryset = queryset.filter(station_id=station_id)

        if measurement_type:
            queryset = queryset.filter(measurement_type=measurement_type)

        # Calculate statistics
        stats = queryset.aggregate(
            count=Count('id'),
            avg_value=Avg('value'),
            min_value=Min('value'),
            max_value=Max('value')
        )

        # Add time-based statistics
        stats.update({
            'period_start': start_date.isoformat(),
            'period_end': end_date.isoformat(),
            'measurements_per_day': stats['count'] / days if days > 0 else 0
        })

        # Cache for 10 minutes
        cache.set(cache_key, stats, 600)
        return Response(stats)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Optimized bulk creation of measurements."""
        measurements_data = request.data.get('measurements', [])

        if not measurements_data:
            return Response(
                {'error': 'No measurements data provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Use bulk operation mixin
        result = self.bulk_create_optimized(
            MeasurementDetailSerializer,
            measurements_data,
            batch_size=100
        )

        # Invalidate related caches
        self.invalidate_cache_pattern('latest_measurements')
        self.invalidate_cache_pattern('stats')

        return Response({
            'created_count': result['created_count'],
            'errors': result['errors']
        }, status=status.HTTP_201_CREATED if result['created_count'] > 0 else status.HTTP_400_BAD_REQUEST)


class OptimizedAlertViewSet(ComprehensiveOptimizationMixin, viewsets.ModelViewSet):
    """
    Optimized ViewSet for alerts with real-time caching.
    """
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    # Optimization settings
    select_related_fields = ['measurement__station', 'measurement__sensor', 'threshold']
    cache_timeout = 60  # 1 minute for alerts (more real-time)
    rate_limit_key = 'alerts'

    def get_queryset(self):
        """Optimized queryset for alerts."""
        queryset = Alert.objects.all()

        # Apply user permissions
        if self.request.user.role != UserRole.ADMIN:
            assigned_stations = self.request.user.assigned_stations.all()
            queryset = queryset.filter(measurement__station__in=assigned_stations)

        return queryset.select_related(*self.select_related_fields).order_by('-created_at')

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active alerts with caching."""
        cache_key = f"active_alerts:{request.user.id}"
        cached_alerts = cache.get(cache_key)

        if cached_alerts:
            return Response(cached_alerts)

        # Get active alerts
        active_alerts = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(active_alerts, many=True)

        # Cache for 30 seconds (very real-time)
        cache.set(cache_key, serializer.data, 30)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get alert summary statistics."""
        cache_key = f"alert_summary:{request.user.id}"
        cached_summary = cache.get(cache_key)

        if cached_summary:
            return Response(cached_summary)

        queryset = self.get_queryset()

        # Calculate summary
        summary = {
            'total_alerts': queryset.count(),
            'active_alerts': queryset.filter(status='active').count(),
            'critical_alerts': queryset.filter(level='critical').count(),
            'warning_alerts': queryset.filter(level='warning').count(),
            'alerts_last_24h': queryset.filter(
                created_at__gte=timezone.now() - timedelta(hours=24)
            ).count()
        }

        # Cache for 2 minutes
        cache.set(cache_key, summary, 120)
        return Response(summary)


class OptimizedThresholdViewSet(ComprehensiveOptimizationMixin, viewsets.ModelViewSet):
    """
    Optimized ViewSet for thresholds.
    """
    serializer_class = ThresholdSerializer
    permission_classes = [IsAuthenticated]

    # Optimization settings
    select_related_fields = ['station']
    cache_timeout = 1800  # 30 minutes (thresholds change less frequently)

    def get_queryset(self):
        """Optimized queryset for thresholds."""
        queryset = Threshold.objects.all()

        # Apply user permissions
        if self.request.user.role != UserRole.ADMIN:
            assigned_stations = self.request.user.assigned_stations.all()
            queryset = queryset.filter(station__in=assigned_stations)

        return queryset.select_related(*self.select_related_fields)

    def create(self, request, *args, **kwargs):
        """Override create to invalidate cache."""
        response = super().create(request, *args, **kwargs)

        if response.status_code == 201:
            # Invalidate threshold-related caches
            self.invalidate_cache_pattern('thresholds')

        return response

    def update(self, request, *args, **kwargs):
        """Override update to invalidate cache."""
        response = super().update(request, *args, **kwargs)

        if response.status_code == 200:
            # Invalidate threshold-related caches
            self.invalidate_cache_pattern('thresholds')

        return response