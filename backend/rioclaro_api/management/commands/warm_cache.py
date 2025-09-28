"""
Management command to warm up the application cache.
"""

import logging
from django.core.management.base import BaseCommand
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from stations.models import Station
from measurements.models import Measurement, Alert

logger = logging.getLogger(__name__)
User = get_user_model()


class Command(BaseCommand):
    help = 'Warm up application cache with frequently accessed data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear cache before warming',
        )
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Verbose output',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing cache...')
            cache.clear()

        verbose = options['verbose']

        self.stdout.write('Starting cache warming...')

        # Warm up station data
        self._warm_stations(verbose)

        # Warm up latest measurements
        self._warm_latest_measurements(verbose)

        # Warm up alert data
        self._warm_alerts(verbose)

        # Warm up statistics
        self._warm_statistics(verbose)

        self.stdout.write(
            self.style.SUCCESS('Cache warming completed successfully!')
        )

    def _warm_stations(self, verbose):
        """Warm up station-related cache."""
        if verbose:
            self.stdout.write('Warming station cache...')

        stations = Station.objects.filter(is_active=True).select_related()

        # Cache active stations
        cache.set('active_stations', list(stations.values()), 1800)  # 30 minutes

        if verbose:
            self.stdout.write(f'  Cached {stations.count()} active stations')

    def _warm_latest_measurements(self, verbose):
        """Warm up latest measurements cache."""
        if verbose:
            self.stdout.write('Warming latest measurements cache...')

        stations = Station.objects.filter(is_active=True)

        for station in stations:
            latest_measurement = Measurement.objects.filter(
                station=station
            ).select_related('station', 'sensor').order_by('-timestamp').first()

            if latest_measurement:
                cache_key = f"latest_measurement_station_{station.id}"
                cache.set(cache_key, {
                    'id': latest_measurement.id,
                    'value': str(latest_measurement.value),
                    'timestamp': latest_measurement.timestamp.isoformat(),
                    'measurement_type': latest_measurement.measurement_type,
                    'station_name': station.name,
                }, 120)  # 2 minutes

        if verbose:
            self.stdout.write(f'  Cached latest measurements for {stations.count()} stations')

    def _warm_alerts(self, verbose):
        """Warm up alert-related cache."""
        if verbose:
            self.stdout.write('Warming alerts cache...')

        # Cache active alerts count
        active_alerts_count = Alert.objects.filter(status='active').count()
        cache.set('active_alerts_count', active_alerts_count, 300)  # 5 minutes

        # Cache critical alerts count
        critical_alerts_count = Alert.objects.filter(
            level='critical',
            status='active'
        ).count()
        cache.set('critical_alerts_count', critical_alerts_count, 300)

        if verbose:
            self.stdout.write(f'  Cached alert counts: {active_alerts_count} active, {critical_alerts_count} critical')

    def _warm_statistics(self, verbose):
        """Warm up statistics cache."""
        if verbose:
            self.stdout.write('Warming statistics cache...')

        # Calculate and cache system statistics
        now = timezone.now()
        last_24h = now - timedelta(hours=24)
        last_7d = now - timedelta(days=7)

        stats = {
            'total_stations': Station.objects.filter(is_active=True).count(),
            'total_measurements': Measurement.objects.count(),
            'measurements_last_24h': Measurement.objects.filter(
                timestamp__gte=last_24h
            ).count(),
            'measurements_last_7d': Measurement.objects.filter(
                timestamp__gte=last_7d
            ).count(),
            'total_alerts': Alert.objects.count(),
            'active_alerts': Alert.objects.filter(status='active').count(),
            'generated_at': now.isoformat()
        }

        cache.set('system_statistics', stats, 900)  # 15 minutes

        if verbose:
            self.stdout.write('  Cached system statistics')
            for key, value in stats.items():
                if key != 'generated_at':
                    self.stdout.write(f'    {key}: {value}')

        # Cache measurement types statistics
        measurement_types_stats = {}
        for measurement_type, display_name in Measurement.MeasurementType.choices:
            count = Measurement.objects.filter(
                measurement_type=measurement_type,
                timestamp__gte=last_7d
            ).count()
            measurement_types_stats[measurement_type] = {
                'display_name': display_name,
                'count_last_7d': count
            }

        cache.set('measurement_types_stats', measurement_types_stats, 1800)  # 30 minutes

        if verbose:
            self.stdout.write('  Cached measurement types statistics')