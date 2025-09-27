"""
Serializers para el Módulo 4: Escalabilidad y Módulos Adicionales
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_dynamic import (
    SensorTypeCategory,
    DynamicSensorType,
    ModuleConfiguration,
    ModuleAccess,
    ExtensibleMeasurement
)

User = get_user_model()


class SensorTypeCategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorías de sensores
    """
    sensor_types_count = serializers.SerializerMethodField()

    class Meta:
        model = SensorTypeCategory
        fields = [
            'id', 'name', 'code', 'description', 'icon', 'color_code',
            'is_active', 'sensor_types_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_sensor_types_count(self, obj):
        """Cuenta los tipos de sensores activos en esta categoría"""
        return obj.dynamicsensortype_set.filter(is_active=True).count()


class DynamicSensorTypeSerializer(serializers.ModelSerializer):
    """
    RF4.1 - Serializer para tipos de sensores dinámicos
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    display_name = serializers.SerializerMethodField()
    formatted_example = serializers.SerializerMethodField()

    class Meta:
        model = DynamicSensorType
        fields = [
            'id', 'uuid', 'name', 'code', 'category', 'category_name',
            'description', 'manufacturer', 'model_number',
            'measurement_unit', 'precision_decimals', 'min_value', 'max_value',
            'validation_rules', 'display_name', 'display_format', 'chart_type',
            'is_active', 'requires_calibration', 'sampling_frequency',
            'default_thresholds', 'formatted_example',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']

    def get_display_name(self, obj):
        """Obtiene el nombre para mostrar"""
        return obj.get_display_name()

    def get_formatted_example(self, obj):
        """Muestra un ejemplo de formato de valor"""
        example_value = obj.min_value or 25.5
        return obj.format_value(example_value)

    def validate(self, attrs):
        """Validaciones personalizadas"""
        min_val = attrs.get('min_value')
        max_val = attrs.get('max_value')

        if min_val and max_val and min_val >= max_val:
            raise serializers.ValidationError({
                'max_value': 'El valor máximo debe ser mayor al mínimo'
            })

        return attrs


class DynamicSensorTypeCreateSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para crear nuevos tipos de sensores
    """
    class Meta:
        model = DynamicSensorType
        fields = [
            'name', 'code', 'category', 'description', 'manufacturer', 'model_number',
            'measurement_unit', 'precision_decimals', 'min_value', 'max_value',
            'validation_rules', 'display_name', 'display_format', 'chart_type',
            'requires_calibration', 'sampling_frequency', 'default_thresholds'
        ]

    def create(self, validated_data):
        """Crea el sensor asignando el usuario creador"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class ModuleConfigurationSerializer(serializers.ModelSerializer):
    """
    RF4.3 - Serializer para configuración de módulos
    """
    is_available = serializers.SerializerMethodField()
    dependencies_status = serializers.SerializerMethodField()

    class Meta:
        model = ModuleConfiguration
        fields = [
            'id', 'name', 'display_name', 'version', 'is_enabled', 'is_visible',
            'description', 'dependencies', 'permissions_required', 'configuration',
            'is_available', 'dependencies_status', 'order', 'category',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_is_available(self, obj):
        """Verifica si el módulo está disponible para el usuario actual"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.is_available_for_user(request.user)
        return obj.is_enabled and obj.is_visible_to_users

    def get_dependencies_status(self, obj):
        """Estado de las dependencias del módulo"""
        status = {}
        dependencies = obj.get_dependencies()
        for dep_name in dependencies:
            try:
                dep = ModuleConfiguration.objects.get(name=dep_name)
                status[dep_name] = {
                    'exists': True,
                    'enabled': dep.is_enabled,
                    'name': dep.display_name
                }
            except ModuleConfiguration.DoesNotExist:
                status[dep_name] = {
                    'exists': False,
                    'enabled': False,
                    'name': dep_name
                }
        return status


class ModuleAccessSerializer(serializers.ModelSerializer):
    """
    Serializer para gestión de accesos a módulos
    """
    module_name = serializers.CharField(source='module.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    granted_by_username = serializers.CharField(source='granted_by.username', read_only=True)

    class Meta:
        model = ModuleAccess
        fields = [
            'id', 'user', 'module', 'module_name', 'user_username',
            'granted_at', 'granted_by', 'granted_by_username'
        ]
        read_only_fields = ['granted_at']


class ExtensibleMeasurementSerializer(serializers.ModelSerializer):
    """
    RF4.1 - Serializer para mediciones extensibles
    """
    sensor_type_name = serializers.CharField(source='sensor_type.name', read_only=True)
    sensor_unit = serializers.CharField(source='sensor_type.measurement_unit', read_only=True)
    station_name = serializers.CharField(source='station.name', read_only=True)
    formatted_value = serializers.SerializerMethodField()

    class Meta:
        model = ExtensibleMeasurement
        fields = [
            'id', 'sensor_type', 'sensor_type_name', 'station', 'station_name',
            'value', 'sensor_unit', 'formatted_value', 'timestamp', 'metadata',
            'quality_flag', 'created_at'
        ]
        read_only_fields = ['created_at']

    def get_formatted_value(self, obj):
        """Valor formateado según el tipo de sensor"""
        return obj.get_formatted_value()

    def validate_value(self, value):
        """Validación del valor usando las reglas del sensor"""
        sensor_type = self.initial_data.get('sensor_type')
        if sensor_type:
            try:
                sensor = DynamicSensorType.objects.get(pk=sensor_type)
                errors = sensor.validate_measurement_value(value)
                if errors:
                    raise serializers.ValidationError(errors)
            except DynamicSensorType.DoesNotExist:
                pass
        return value


class ExtensibleMeasurementCreateSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para crear mediciones extensibles
    """
    class Meta:
        model = ExtensibleMeasurement
        fields = [
            'sensor_type', 'station', 'value', 'timestamp',
            'metadata', 'quality_flag'
        ]

    def create(self, validated_data):
        """Crea la medición asignando el usuario creador"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class BatchExtensibleMeasurementSerializer(serializers.Serializer):
    """
    Serializer para crear mediciones extensibles en lote
    """
    measurements = ExtensibleMeasurementCreateSerializer(many=True)

    def create(self, validated_data):
        """Crea múltiples mediciones de manera eficiente"""
        measurements_data = validated_data['measurements']
        request = self.context.get('request')

        measurements = []
        for measurement_data in measurements_data:
            if request and hasattr(request, 'user'):
                measurement_data['created_by'] = request.user
            measurements.append(ExtensibleMeasurement(**measurement_data))

        return ExtensibleMeasurement.objects.bulk_create(measurements)


class SensorTypeUsageStatsSerializer(serializers.Serializer):
    """
    Estadísticas de uso de tipos de sensores
    """
    sensor_type_id = serializers.IntegerField()
    sensor_type_name = serializers.CharField()
    total_measurements = serializers.IntegerField()
    active_stations = serializers.IntegerField()
    last_measurement = serializers.DateTimeField()
    avg_daily_measurements = serializers.DecimalField(max_digits=10, decimal_places=2)


class ModuleUsageStatsSerializer(serializers.Serializer):
    """
    Estadísticas de uso de módulos del sistema
    """
    module_id = serializers.IntegerField()
    module_name = serializers.CharField()
    total_users = serializers.IntegerField()
    active_users_last_30d = serializers.IntegerField()
    last_access = serializers.DateTimeField()
    configuration_changes = serializers.IntegerField()
