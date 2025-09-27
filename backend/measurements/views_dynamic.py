"""
Views para el Módulo 4: Escalabilidad y Módulos Adicionales
Implementación de arquitectura escalable y gestión modular
"""
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Avg, Max
from django.utils import timezone
from django.db import transaction
from datetime import timedelta

from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models_dynamic import (
    SensorTypeCategory,
    DynamicSensorType,
    ModuleConfiguration,
    ModuleAccess,
    ExtensibleMeasurement
)
from .serializers_dynamic import (
    SensorTypeCategorySerializer,
    DynamicSensorTypeSerializer,
    DynamicSensorTypeCreateSerializer,
    ModuleConfigurationSerializer,
    ModuleAccessSerializer,
    ExtensibleMeasurementSerializer,
    ExtensibleMeasurementCreateSerializer,
    BatchExtensibleMeasurementSerializer,
    SensorTypeUsageStatsSerializer,
    ModuleUsageStatsSerializer
)


class SensorTypeCategoryViewSet(ModelViewSet):
    """
    ViewSet para gestión de categorías de sensores
    RF4.1 - Organización modular de tipos de sensores
    """
    queryset = SensorTypeCategory.objects.all()
    serializer_class = SensorTypeCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        """
        Permisos: Solo admins pueden crear/editar/eliminar
        Usuarios normales solo pueden listar y ver detalles
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['get'])
    def sensor_types(self, request, pk=None):
        """Obtiene los tipos de sensores de una categoría"""
        category = self.get_object()
        sensor_types = DynamicSensorType.objects.filter(
            category=category,
            is_active=True
        )
        serializer = DynamicSensorTypeSerializer(sensor_types, many=True)
        return Response(serializer.data)


class DynamicSensorTypeFilter(django_filters.FilterSet):
    """Filtros para tipos de sensores dinámicos"""
    category = django_filters.ModelChoiceFilter(queryset=SensorTypeCategory.objects.all())
    is_active = django_filters.BooleanFilter()
    requires_calibration = django_filters.BooleanFilter()
    chart_type = django_filters.ChoiceFilter(choices=DynamicSensorType._meta.get_field('chart_type').choices)

    class Meta:
        model = DynamicSensorType
        fields = ['category', 'is_active', 'requires_calibration', 'chart_type']


class DynamicSensorTypeViewSet(ModelViewSet):
    """
    RF4.1 - ViewSet para gestión de tipos de sensores dinámicos
    Permite crear, modificar y gestionar nuevos tipos de sensores
    """
    queryset = DynamicSensorType.objects.select_related('category').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = DynamicSensorTypeFilter
    search_fields = ['name', 'code', 'description', 'manufacturer', 'model_number']
    ordering_fields = ['name', 'category__name', 'created_at']
    ordering = ['category__name', 'name']

    def get_serializer_class(self):
        """Usa serializers diferentes según la acción"""
        if self.action == 'create':
            return DynamicSensorTypeCreateSerializer
        return DynamicSensorTypeSerializer

    def get_permissions(self):
        """Solo admins pueden crear/editar/eliminar tipos de sensores"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """RF4.3 - Activa/desactiva un tipo de sensor"""
        sensor_type = self.get_object()
        sensor_type.is_active = not sensor_type.is_active
        sensor_type.save()

        serializer = self.get_serializer(sensor_type)
        return Response({
            'message': f'Sensor {sensor_type.name} {"activado" if sensor_type.is_active else "desactivado"}',
            'sensor_type': serializer.data
        })

    @action(detail=True, methods=['get'])
    def validation_test(self, request, pk=None):
        """Prueba las reglas de validación de un sensor"""
        sensor_type = self.get_object()
        test_value = request.query_params.get('value')

        if not test_value:
            return Response(
                {'error': 'Parámetro "value" requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            test_value = float(test_value)
            errors = sensor_type.validate_measurement_value(test_value)

            return Response({
                'value': test_value,
                'formatted_value': sensor_type.format_value(test_value),
                'is_valid': len(errors) == 0,
                'validation_errors': errors
            })
        except ValueError:
            return Response(
                {'error': 'Valor debe ser numérico'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def usage_stats(self, request):
        """Estadísticas de uso de tipos de sensores"""
        stats_data = []
        sensor_types = DynamicSensorType.objects.filter(is_active=True)

        for sensor_type in sensor_types:
            measurements = ExtensibleMeasurement.objects.filter(sensor_type=sensor_type)
            total_measurements = measurements.count()
            active_stations = measurements.values('station').distinct().count()
            last_measurement = measurements.order_by('-timestamp').first()

            # Calcular promedio diario (últimos 30 días)
            thirty_days_ago = timezone.now() - timedelta(days=30)
            recent_measurements = measurements.filter(timestamp__gte=thirty_days_ago).count()
            avg_daily = recent_measurements / 30.0 if recent_measurements > 0 else 0

            stats_data.append({
                'sensor_type_id': sensor_type.id,
                'sensor_type_name': sensor_type.name,
                'total_measurements': total_measurements,
                'active_stations': active_stations,
                'last_measurement': last_measurement.timestamp if last_measurement else None,
                'avg_daily_measurements': round(avg_daily, 2)
            })

        serializer = SensorTypeUsageStatsSerializer(stats_data, many=True)
        return Response(serializer.data)


class ModuleConfigurationViewSet(ModelViewSet):
    """
    RF4.3 - ViewSet para gestión de módulos del sistema
    Control de activación/desactivación de funcionalidades
    """
    queryset = ModuleConfiguration.objects.all()
    serializer_class = ModuleConfigurationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_enabled', 'is_visible']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        """Solo admins pueden gestionar módulos"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Filtrar módulos según disponibilidad para el usuario"""
        queryset = super().get_queryset()

        # Si no es admin, solo mostrar módulos disponibles
        if not self.request.user.is_staff:
            available_modules = []
            for module in queryset:
                if module.is_available_for_user(self.request.user):
                    available_modules.append(module.pk)
            queryset = queryset.filter(pk__in=available_modules)

        return queryset

    @action(detail=True, methods=['post'])
    def toggle_enabled(self, request, pk=None):
        """Activa/desactiva un módulo"""
        module = self.get_object()
        module.is_enabled = not module.is_enabled
        module.save()

        return Response({
            'message': f'Módulo {module.name} {"habilitado" if module.is_enabled else "deshabilitado"}',
            'is_enabled': module.is_enabled
        })

    @action(detail=True, methods=['post'])
    def toggle_visibility(self, request, pk=None):
        """Controla la visibilidad de un módulo para usuarios"""
        module = self.get_object()
        module.is_visible = not module.is_visible
        module.save()

        return Response({
            'message': f'Módulo {module.name} {"visible" if module.is_visible else "oculto"} para usuarios',
            'is_visible': module.is_visible
        })

    @action(detail=True, methods=['get'])
    def check_dependencies(self, request, pk=None):
        """Verifica el estado de las dependencias de un módulo"""
        module = self.get_object()

        dependency_status = {}
        all_satisfied = True

        for dep_code in module.dependencies:
            try:
                dep_module = ModuleConfiguration.objects.get(code=dep_code)
                is_satisfied = dep_module.is_enabled
                dependency_status[dep_code] = {
                    'exists': True,
                    'enabled': is_satisfied,
                    'name': dep_module.name,
                    'satisfied': is_satisfied
                }
                if not is_satisfied:
                    all_satisfied = False
            except ModuleConfiguration.DoesNotExist:
                dependency_status[dep_code] = {
                    'exists': False,
                    'enabled': False,
                    'name': dep_code,
                    'satisfied': False
                }
                all_satisfied = False

        return Response({
            'module': module.name,
            'dependencies_satisfied': all_satisfied,
            'dependencies': dependency_status
        })

    @action(detail=False, methods=['get'])
    def available_for_user(self, request):
        """Lista módulos disponibles para el usuario actual"""
        available_modules = []

        for module in self.get_queryset():
            if module.is_available_for_user(request.user):
                serializer = self.get_serializer(module)
                available_modules.append(serializer.data)

        return Response(available_modules)


class ExtensibleMeasurementFilter(django_filters.FilterSet):
    """Filtros para mediciones extensibles"""
    sensor_type = django_filters.ModelChoiceFilter(queryset=DynamicSensorType.objects.all())
    timestamp_after = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')
    timestamp_before = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')
    quality_flag = django_filters.ChoiceFilter(choices=ExtensibleMeasurement._meta.get_field('quality_flag').choices)

    class Meta:
        model = ExtensibleMeasurement
        fields = ['sensor_type', 'station', 'quality_flag']


class ExtensibleMeasurementViewSet(ModelViewSet):
    """
    RF4.1 - ViewSet para mediciones de sensores dinámicos
    Gestiona mediciones de cualquier tipo de sensor registrado
    """
    queryset = ExtensibleMeasurement.objects.select_related(
        'sensor_type', 'sensor_type__category', 'station'
    ).all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = ExtensibleMeasurementFilter
    ordering_fields = ['timestamp', 'value']
    ordering = ['-timestamp']

    def get_serializer_class(self):
        """Usa serializers diferentes según la acción"""
        if self.action == 'create':
            return ExtensibleMeasurementCreateSerializer
        return ExtensibleMeasurementSerializer

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Crear múltiples mediciones en lote"""
        serializer = BatchExtensibleMeasurementSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            measurements = serializer.save()

        return Response({
            'message': f'{len(measurements)} mediciones creadas exitosamente',
            'count': len(measurements)
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def by_sensor_type(self, request):
        """Obtiene mediciones agrupadas por tipo de sensor"""
        sensor_type_id = request.query_params.get('sensor_type_id')
        if not sensor_type_id:
            return Response(
                {'error': 'Parámetro sensor_type_id requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        measurements = self.get_queryset().filter(sensor_type_id=sensor_type_id)

        # Aplicar filtros adicionales
        filtered_queryset = self.filter_queryset(measurements)
        page = self.paginate_queryset(filtered_queryset)

        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(filtered_queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def latest_by_station(self, request):
        """Obtiene las últimas mediciones por estación"""
        station_id = request.query_params.get('station_id')
        if not station_id:
            return Response(
                {'error': 'Parámetro station_id requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtener la última medición de cada tipo de sensor para la estación
        latest_measurements = []
        sensor_types = DynamicSensorType.objects.filter(is_active=True)

        for sensor_type in sensor_types:
            latest = ExtensibleMeasurement.objects.filter(
                sensor_type=sensor_type,
                station_id=station_id
            ).order_by('-timestamp').first()

            if latest:
                latest_measurements.append(latest)

        serializer = self.get_serializer(latest_measurements, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_modules_overview(request):
    """
    RF4.3 - Vista general del estado de módulos del sistema
    """
    modules = ModuleConfiguration.objects.all()

    overview = {
        'total_modules': modules.count(),
        'enabled_modules': modules.filter(is_enabled=True).count(),
        'visible_modules': modules.filter(is_visible=True).count(),
        'available_for_user': 0,
        'modules_by_status': []
    }

    # Contar módulos disponibles para el usuario actual
    for module in modules:
        if module.is_available_for_user(request.user):
            overview['available_for_user'] += 1

        overview['modules_by_status'].append({
            'name': module.name,
            'name': module.name,
            'enabled': module.is_enabled,
            'visible': module.is_visible,
            'available_for_user': module.is_available_for_user(request.user)
        })

    return Response(overview)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sensor_ecosystem_overview(request):
    """
    RF4.1 - Vista general del ecosistema de sensores
    """
    categories = SensorTypeCategory.objects.filter(is_active=True)
    sensor_types = DynamicSensorType.objects.filter(is_active=True)

    overview = {
        'total_categories': categories.count(),
        'total_sensor_types': sensor_types.count(),
        'total_measurements': ExtensibleMeasurement.objects.count(),
        'categories_breakdown': [],
        'measurement_distribution': {}
    }

    # Desglose por categorías
    for category in categories:
        category_sensors = sensor_types.filter(category=category)
        category_measurements = ExtensibleMeasurement.objects.filter(
            sensor_type__in=category_sensors
        ).count()

        overview['categories_breakdown'].append({
            'category': category.name,
            'sensor_types': category_sensors.count(),
            'measurements': category_measurements
        })

    # Distribución de mediciones por tipo de sensor
    for sensor_type in sensor_types:
        measurement_count = ExtensibleMeasurement.objects.filter(
            sensor_type=sensor_type
        ).count()
        overview['measurement_distribution'][sensor_type.name] = measurement_count

    return Response(overview)
