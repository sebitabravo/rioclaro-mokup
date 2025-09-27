from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from .models import (
    Measurement,
    Threshold,
    Alert,
    MeasurementConfiguration,
    MeasurementType,
    AlertLevel,
    AlertStatus
)
from stations.models import Station
from sensors.models import Sensor


class MeasurementListSerializer(serializers.ModelSerializer):
    """
    Serializer optimizado para listar mediciones (RF2.3)
    """
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_code = serializers.CharField(source='station.code', read_only=True)
    sensor_name = serializers.CharField(source='sensor.name', read_only=True)
    measurement_type_display = serializers.CharField(source='get_measurement_type_display', read_only=True)
    quality_flag_display = serializers.CharField(source='get_quality_flag_display', read_only=True)
    is_recent = serializers.SerializerMethodField()

    class Meta:
        model = Measurement
        fields = [
            'id', 'station', 'station_name', 'station_code',
            'sensor', 'sensor_name', 'measurement_type', 'measurement_type_display',
            'value', 'unit', 'quality_flag', 'quality_flag_display',
            'timestamp', 'received_at', 'is_recent'
        ]
        read_only_fields = ['received_at']

    def get_is_recent(self, obj):
        """Indica si la medición es reciente (últimos 30 minutos)"""
        return obj.is_recent()


class MeasurementDetailSerializer(serializers.ModelSerializer):
    """
    Serializer detallado para mediciones individuales
    """
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_code = serializers.CharField(source='station.code', read_only=True)
    sensor_name = serializers.CharField(source='sensor.name', read_only=True)
    sensor_type = serializers.CharField(source='sensor.sensor_type', read_only=True)
    measurement_type_display = serializers.CharField(source='get_measurement_type_display', read_only=True)
    quality_flag_display = serializers.CharField(source='get_quality_flag_display', read_only=True)

    class Meta:
        model = Measurement
        fields = [
            'id', 'station', 'station_name', 'station_code',
            'sensor', 'sensor_name', 'sensor_type',
            'measurement_type', 'measurement_type_display',
            'value', 'raw_value', 'unit',
            'quality_flag', 'quality_flag_display',
            'timestamp', 'received_at', 'metadata'
        ]
        read_only_fields = ['received_at']


class MeasurementCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear nuevas mediciones (RF2.2)
    Optimizado para recepción de datos desde sensores/PLC
    """

    class Meta:
        model = Measurement
        fields = [
            'station', 'sensor', 'measurement_type',
            'value', 'raw_value', 'unit', 'quality_flag',
            'timestamp', 'metadata'
        ]

    def validate(self, data):
        """
        Validaciones personalizadas para las mediciones
        """
        # Validar que el sensor pertenece a la estación
        if data['sensor'].station != data['station']:
            raise serializers.ValidationError(
                "El sensor especificado no pertenece a la estación indicada"
            )

        # Validar timestamp (no puede ser futuro)
        if data['timestamp'] > timezone.now():
            raise serializers.ValidationError(
                "La fecha y hora no puede ser futura"
            )

        # Validar que no existe una medición idéntica
        if Measurement.objects.filter(
            station=data['station'],
            sensor=data['sensor'],
            timestamp=data['timestamp']
        ).exists():
            raise serializers.ValidationError(
                "Ya existe una medición para este sensor en la fecha y hora especificada"
            )

        return data

    def create(self, validated_data):
        """
        Crear medición y verificar umbrales para generar alertas automáticas
        """
        with transaction.atomic():
            measurement = super().create(validated_data)

            # Verificar umbrales y generar alertas si es necesario (RF2.5)
            self._check_thresholds_and_create_alerts(measurement)

            return measurement

    def _check_thresholds_and_create_alerts(self, measurement):
        """
        Verifica umbrales y crea alertas automáticas cuando es necesario
        """
        try:
            threshold = Threshold.objects.get(
                station=measurement.station,
                measurement_type=measurement.measurement_type,
                is_active=True
            )

            alert_level = threshold.get_alert_level_for_value(measurement.value)

            if alert_level != 'normal':
                # Mapeo de niveles internos a AlertLevel
                alert_level_mapping = {
                    'warning': AlertLevel.WARNING,
                    'critical': AlertLevel.CRITICAL
                }

                # Verificar si ya existe una alerta activa reciente para evitar spam
                recent_alerts = Alert.objects.filter(
                    station=measurement.station,
                    threshold=threshold,
                    status=AlertStatus.ACTIVE,
                    triggered_at__gte=timezone.now() - timezone.timedelta(hours=1)
                )

                if not recent_alerts.exists():
                    Alert.objects.create(
                        station=measurement.station,
                        measurement=measurement,
                        threshold=threshold,
                        level=alert_level_mapping.get(alert_level, AlertLevel.WARNING),
                        title=f"Umbral {alert_level} superado en {measurement.station.name}",
                        message=f"El valor {measurement.value} {measurement.unit} "
                                f"de {measurement.get_measurement_type_display()} "
                                f"ha superado el umbral {alert_level} configurado.",
                        metadata={
                            'value': str(measurement.value),
                            'unit': measurement.unit,
                            'threshold_level': alert_level,
                            'auto_generated': True
                        }
                    )
        except Threshold.DoesNotExist:
            # No hay umbral configurado para este tipo de medición
            pass


class LatestMeasurementSerializer(serializers.ModelSerializer):
    """
    Serializer para la última medición de una estación (RF2.1)
    """
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_code = serializers.CharField(source='station.code', read_only=True)
    sensor_name = serializers.CharField(source='sensor.name', read_only=True)
    measurement_type_display = serializers.CharField(source='get_measurement_type_display', read_only=True)
    time_since_measurement = serializers.SerializerMethodField()

    class Meta:
        model = Measurement
        fields = [
            'id', 'station', 'station_name', 'station_code',
            'sensor', 'sensor_name', 'measurement_type', 'measurement_type_display',
            'value', 'unit', 'timestamp', 'time_since_measurement'
        ]

    def get_time_since_measurement(self, obj):
        """Calcula el tiempo transcurrido desde la medición"""
        delta = timezone.now() - obj.timestamp

        if delta.days > 0:
            return f"{delta.days} días"
        elif delta.seconds > 3600:
            hours = delta.seconds // 3600
            return f"{hours} horas"
        elif delta.seconds > 60:
            minutes = delta.seconds // 60
            return f"{minutes} minutos"
        else:
            return "Menos de 1 minuto"


class ThresholdSerializer(serializers.ModelSerializer):
    """
    Serializer para configuración de umbrales (RF2.4)
    """
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_code = serializers.CharField(source='station.code', read_only=True)
    measurement_type_display = serializers.CharField(source='get_measurement_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.get_full_name', read_only=True)

    class Meta:
        model = Threshold
        fields = [
            'id', 'station', 'station_name', 'station_code',
            'measurement_type', 'measurement_type_display',
            'warning_min', 'warning_max', 'critical_min', 'critical_max',
            'unit', 'is_active', 'notes',
            'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Validaciones para umbrales
        """
        # Al menos un umbral debe estar definido
        thresholds = [
            data.get('warning_min'), data.get('warning_max'),
            data.get('critical_min'), data.get('critical_max')
        ]

        if all(threshold is None for threshold in thresholds):
            raise serializers.ValidationError(
                "Al menos un umbral (advertencia o crítico) debe estar definido"
            )

        # Validar que los mínimos sean menores que los máximos
        if data.get('warning_min') and data.get('warning_max'):
            if data['warning_min'] >= data['warning_max']:
                raise serializers.ValidationError(
                    "El umbral mínimo de advertencia debe ser menor que el máximo"
                )

        if data.get('critical_min') and data.get('critical_max'):
            if data['critical_min'] >= data['critical_max']:
                raise serializers.ValidationError(
                    "El umbral mínimo crítico debe ser menor que el máximo"
                )

        # Validar lógica de umbrales críticos vs advertencia
        if data.get('critical_min') and data.get('warning_min'):
            if data['critical_min'] > data['warning_min']:
                raise serializers.ValidationError(
                    "El umbral crítico mínimo debe ser menor o igual al de advertencia"
                )

        if data.get('critical_max') and data.get('warning_max'):
            if data['critical_max'] < data['warning_max']:
                raise serializers.ValidationError(
                    "El umbral crítico máximo debe ser mayor o igual al de advertencia"
                )

        return data

    def create(self, validated_data):
        """Crear umbral asignando el usuario creador"""
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Actualizar umbral asignando el usuario que actualiza"""
        user = self.context['request'].user
        validated_data['updated_by'] = user
        return super().update(instance, validated_data)


class AlertSerializer(serializers.ModelSerializer):
    """
    Serializer para alertas del sistema (RF2.5)
    """
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_code = serializers.CharField(source='station.code', read_only=True)
    measurement_value = serializers.DecimalField(source='measurement.value', max_digits=12, decimal_places=4, read_only=True)
    measurement_unit = serializers.CharField(source='measurement.unit', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    duration_minutes = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = [
            'id', 'station', 'station_name', 'station_code',
            'measurement', 'measurement_value', 'measurement_unit',
            'threshold', 'level', 'level_display', 'status', 'status_display',
            'title', 'message', 'triggered_at',
            'acknowledged_at', 'acknowledged_by', 'acknowledged_by_name',
            'resolved_at', 'resolved_by', 'resolved_by_name',
            'resolution_notes', 'metadata', 'duration_minutes'
        ]
        read_only_fields = [
            'triggered_at', 'acknowledged_at', 'acknowledged_by',
            'resolved_at', 'resolved_by'
        ]

    def get_duration_minutes(self, obj):
        """Calcula la duración de la alerta en minutos"""
        duration = obj.duration
        return int(duration.total_seconds() / 60)


class AlertActionSerializer(serializers.Serializer):
    """
    Serializer para acciones sobre alertas (reconocer, resolver, descartar)
    """
    action = serializers.ChoiceField(choices=['acknowledge', 'resolve', 'dismiss'])
    notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)

    def validate(self, data):
        action = data.get('action')
        alert = self.context['alert']

        if action == 'acknowledge' and alert.status != AlertStatus.ACTIVE:
            raise serializers.ValidationError(
                "Solo se pueden reconocer alertas activas"
            )

        if action in ['resolve', 'dismiss'] and alert.status == AlertStatus.RESOLVED:
            raise serializers.ValidationError(
                "Esta alerta ya ha sido resuelta"
            )

        return data


class MeasurementConfigurationSerializer(serializers.ModelSerializer):
    """
    Serializer para configuración de mediciones por estación
    """
    station_name = serializers.CharField(source='station.name', read_only=True)
    station_code = serializers.CharField(source='station.code', read_only=True)

    class Meta:
        model = MeasurementConfiguration
        fields = [
            'id', 'station', 'station_name', 'station_code',
            'measurement_interval_minutes', 'data_retention_days',
            'auto_alerts_enabled', 'notification_email',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MeasurementStatsSerializer(serializers.Serializer):
    """
    Serializer para estadísticas de mediciones
    """
    station_id = serializers.IntegerField()
    station_name = serializers.CharField()
    measurement_type = serializers.CharField()
    measurement_type_display = serializers.CharField()
    count = serializers.IntegerField()
    avg_value = serializers.DecimalField(max_digits=12, decimal_places=4)
    min_value = serializers.DecimalField(max_digits=12, decimal_places=4)
    max_value = serializers.DecimalField(max_digits=12, decimal_places=4)
    latest_timestamp = serializers.DateTimeField()
    unit = serializers.CharField()


class BatchMeasurementCreateSerializer(serializers.Serializer):
    """
    Serializer para crear múltiples mediciones en lote (optimización para PLC)
    """
    measurements = MeasurementCreateSerializer(many=True)

    def validate_measurements(self, value):
        """Validar que no haya más de 1000 mediciones por lote"""
        if len(value) > 1000:
            raise serializers.ValidationError(
                "No se pueden procesar más de 1000 mediciones por lote"
            )
        return value

    def create(self, validated_data):
        """
        Crear mediciones en lote con optimización de rendimiento
        """
        measurements_data = validated_data['measurements']
        measurements = []

        with transaction.atomic():
            for measurement_data in measurements_data:
                serializer = MeasurementCreateSerializer(data=measurement_data)
                serializer.is_valid(raise_exception=True)
                measurement = serializer.save()
                measurements.append(measurement)

        return {'measurements': measurements, 'count': len(measurements)}


# ========================================
# MÓDULO 3: REPORTES - SERIALIZERS
# ========================================

class DailyAverageReportSerializer(serializers.Serializer):
    """
    Serializer para Reporte de Promedios Diarios (RF3.1)

    Optimizado para mostrar promedios de nivel de agua por día
    """
    date = serializers.DateField(
        help_text="Fecha del promedio (YYYY-MM-DD)"
    )
    station_id = serializers.IntegerField(
        help_text="ID de la estación"
    )
    station_name = serializers.CharField(
        help_text="Nombre de la estación"
    )
    station_code = serializers.CharField(
        help_text="Código de la estación"
    )
    measurement_type = serializers.CharField(
        help_text="Tipo de medición"
    )
    measurement_type_display = serializers.CharField(
        help_text="Nombre legible del tipo de medición"
    )
    avg_value = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        help_text="Valor promedio del día"
    )
    min_value = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        help_text="Valor mínimo del día"
    )
    max_value = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        help_text="Valor máximo del día"
    )
    count = serializers.IntegerField(
        help_text="Número de mediciones tomadas en el día"
    )
    unit = serializers.CharField(
        help_text="Unidad de medida"
    )
    first_measurement_time = serializers.DateTimeField(
        help_text="Hora de la primera medición del día"
    )
    last_measurement_time = serializers.DateTimeField(
        help_text="Hora de la última medición del día"
    )


class CriticalEventsReportSerializer(serializers.Serializer):
    """
    Serializer para Reporte de Eventos Críticos (RF3.2)

    Muestra mediciones que superaron umbrales críticos
    """
    measurement_id = serializers.IntegerField(
        help_text="ID de la medición"
    )
    station_id = serializers.IntegerField(
        help_text="ID de la estación"
    )
    station_name = serializers.CharField(
        help_text="Nombre de la estación"
    )
    station_code = serializers.CharField(
        help_text="Código de la estación"
    )
    sensor_name = serializers.CharField(
        help_text="Nombre del sensor"
    )
    measurement_type = serializers.CharField(
        help_text="Tipo de medición"
    )
    measurement_type_display = serializers.CharField(
        help_text="Nombre legible del tipo de medición"
    )
    value = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        help_text="Valor medido que superó el umbral"
    )
    unit = serializers.CharField(
        help_text="Unidad de medida"
    )
    timestamp = serializers.DateTimeField(
        help_text="Fecha y hora de la medición"
    )
    threshold_critical_min = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        allow_null=True,
        help_text="Umbral crítico mínimo configurado"
    )
    threshold_critical_max = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        allow_null=True,
        help_text="Umbral crítico máximo configurado"
    )
    exceeded_threshold_type = serializers.CharField(
        help_text="Tipo de umbral superado (critical_min, critical_max)"
    )
    exceeded_by = serializers.DecimalField(
        max_digits=12,
        decimal_places=4,
        help_text="Cantidad en que se superó el umbral"
    )
    severity_level = serializers.CharField(
        help_text="Nivel de severidad del evento"
    )
    alert_generated = serializers.BooleanField(
        help_text="Indica si se generó una alerta automática"
    )
    alert_id = serializers.IntegerField(
        allow_null=True,
        help_text="ID de la alerta generada (si existe)"
    )


class ComparativeReportDataPoint(serializers.Serializer):
    """
    Punto de datos para reporte comparativo
    """
    timestamp = serializers.DateTimeField()
    value = serializers.DecimalField(max_digits=12, decimal_places=4)
    quality_flag = serializers.CharField()


class ComparativeReportStationData(serializers.Serializer):
    """
    Datos de una estación para reporte comparativo
    """
    station_id = serializers.IntegerField()
    station_name = serializers.CharField()
    station_code = serializers.CharField()
    unit = serializers.CharField()
    data_points = ComparativeReportDataPoint(many=True)
    statistics = serializers.DictField(
        help_text="Estadísticas del período (count, avg, min, max)"
    )


class ComparativeReportSerializer(serializers.Serializer):
    """
    Serializer para Reporte Comparativo entre Estaciones (RF3.3)

    Optimizado para visualización en gráficos
    """
    measurement_type = serializers.CharField(
        help_text="Tipo de medición comparada"
    )
    measurement_type_display = serializers.CharField(
        help_text="Nombre legible del tipo de medición"
    )
    period_start = serializers.DateTimeField(
        help_text="Inicio del período analizado"
    )
    period_end = serializers.DateTimeField(
        help_text="Fin del período analizado"
    )
    total_stations = serializers.IntegerField(
        help_text="Número total de estaciones incluidas"
    )
    stations_data = ComparativeReportStationData(
        many=True,
        help_text="Datos por estación"
    )
    global_statistics = serializers.DictField(
        help_text="Estadísticas globales del período"
    )


class ReportParametersSerializer(serializers.Serializer):
    """
    Serializer para validar parámetros comunes de reportes
    """
    date_from = serializers.DateTimeField(
        help_text="Fecha y hora de inicio (YYYY-MM-DDTHH:MM:SSZ)"
    )
    date_to = serializers.DateTimeField(
        help_text="Fecha y hora de fin (YYYY-MM-DDTHH:MM:SSZ)"
    )
    station_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="Lista de IDs de estaciones a incluir"
    )
    measurement_type = serializers.ChoiceField(
        choices=MeasurementType.choices,
        default=MeasurementType.WATER_LEVEL,
        help_text="Tipo de medición a analizar"
    )
    format = serializers.ChoiceField(
        choices=[
            ('json', 'JSON'),
            ('csv', 'CSV'),
            ('excel', 'Excel')
        ],
        default='json',
        required=False,
        help_text="Formato de salida del reporte"
    )

    def validate(self, data):
        """Validaciones cruzadas para parámetros de reportes"""
        if data['date_from'] >= data['date_to']:
            raise serializers.ValidationError(
                "La fecha de inicio debe ser anterior a la fecha de fin"
            )

        # Validar que el rango no sea mayor a 1 año
        max_days = 365
        if (data['date_to'] - data['date_from']).days > max_days:
            raise serializers.ValidationError(
                f"El rango de fechas no puede ser mayor a {max_days} días"
            )

        return data


class ReportSummarySerializer(serializers.Serializer):
    """
    Serializer para resumen de reportes disponibles
    """
    report_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    endpoint = serializers.CharField()
    parameters = serializers.DictField()
    estimated_execution_time = serializers.CharField()
    data_coverage = serializers.DictField()


class ExportFormatSerializer(serializers.Serializer):
    """
    Serializer para manejar diferentes formatos de exportación
    """
    format = serializers.ChoiceField(
        choices=[
            ('json', 'JSON'),
            ('csv', 'CSV'),
            ('excel', 'Excel'),
            ('pdf', 'PDF')
        ],
        default='json'
    )
    include_metadata = serializers.BooleanField(
        default=True,
        help_text="Incluir metadatos en la exportación"
    )
    include_charts = serializers.BooleanField(
        default=False,
        help_text="Incluir gráficos (solo para PDF/Excel)"
    )