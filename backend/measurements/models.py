from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from stations.models import Station
from sensors.models import Sensor


class MeasurementType(models.TextChoices):
    """Tipos de medición disponibles en el sistema"""
    WATER_LEVEL = 'water_level', 'Nivel de Agua'
    FLOW_RATE = 'flow_rate', 'Caudal'
    TEMPERATURE = 'temperature', 'Temperatura'
    PH = 'ph', 'pH'
    RAINFALL = 'rainfall', 'Precipitación'


class Measurement(models.Model):
    """
    Modelo principal para almacenar mediciones de sensores (RF2.2, RF2.3)

    Este modelo centraliza todas las mediciones del sistema, permitiendo
    flexibilidad para diferentes tipos de sensores y escalabilidad futura.
    """
    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name='measurements',
        verbose_name='Estación',
        help_text='Estación de monitoreo de origen'
    )
    sensor = models.ForeignKey(
        Sensor,
        on_delete=models.CASCADE,
        related_name='measurements',
        verbose_name='Sensor',
        help_text='Sensor específico que realizó la medición'
    )
    measurement_type = models.CharField(
        max_length=20,
        choices=MeasurementType.choices,
        verbose_name='Tipo de Medición',
        help_text='Tipo de variable medida'
    )
    value = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        verbose_name='Valor',
        help_text='Valor numérico de la medición'
    )
    raw_value = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name='Valor Crudo',
        help_text='Valor original sin calibrar (opcional)'
    )
    unit = models.CharField(
        max_length=20,
        verbose_name='Unidad',
        help_text='Unidad de medida (cm, l/s, °C, etc.)'
    )
    quality_flag = models.CharField(
        max_length=20,
        choices=[
            ('good', 'Buena'),
            ('suspect', 'Sospechosa'),
            ('poor', 'Mala'),
            ('missing', 'Faltante'),
        ],
        default='good',
        verbose_name='Indicador de Calidad'
    )
    timestamp = models.DateTimeField(
        verbose_name='Fecha y Hora',
        help_text='Momento exacto de la medición',
        db_index=True  # Índice para optimizar consultas por tiempo
    )
    received_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Recibido en',
        help_text='Momento en que se recibió la medición en el servidor'
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Metadatos',
        help_text='Información adicional sobre la medición'
    )

    class Meta:
        db_table = 'measurements'
        verbose_name = 'Medición'
        verbose_name_plural = 'Mediciones'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['station', '-timestamp']),
            models.Index(fields=['sensor', '-timestamp']),
            models.Index(fields=['measurement_type', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]
        # Constraint para evitar duplicados exactos
        constraints = [
            models.UniqueConstraint(
                fields=['station', 'sensor', 'timestamp'],
                name='unique_measurement_per_sensor_timestamp'
            )
        ]

    def __str__(self):
        return f"{self.station.name} - {self.measurement_type}: {self.value} {self.unit} ({self.timestamp})"

    def is_recent(self, minutes=30):
        """Verifica si la medición es reciente (últimos 30 minutos por defecto)"""
        return timezone.now() - self.timestamp <= timezone.timedelta(minutes=minutes)

    def save(self, *args, **kwargs):
        """
        Override save para validaciones adicionales y consistencia de datos
        """
        # Asegurar que el sensor pertenece a la estación
        if self.sensor.station != self.station:
            raise ValueError("El sensor debe pertenecer a la estación especificada")

        # Asegurar consistencia en el tipo de medición
        if hasattr(self.sensor, 'sensor_type'):
            sensor_type_mapping = {
                'water_level': MeasurementType.WATER_LEVEL,
                'flow_rate': MeasurementType.FLOW_RATE,
                'temperature': MeasurementType.TEMPERATURE,
                'ph': MeasurementType.PH,
            }
            expected_type = sensor_type_mapping.get(self.sensor.sensor_type)
            if expected_type and self.measurement_type != expected_type:
                raise ValueError(f"Tipo de medición inconsistente con el tipo de sensor")

        super().save(*args, **kwargs)


class Threshold(models.Model):
    """
    Modelo para configuración de umbrales críticos por estación (RF2.4)

    Permite a administradores y técnicos definir umbrales específicos
    para cada tipo de medición en cada estación.
    """
    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name='thresholds',
        verbose_name='Estación'
    )
    measurement_type = models.CharField(
        max_length=20,
        choices=MeasurementType.choices,
        verbose_name='Tipo de Medición'
    )
    # Umbrales múltiples para diferentes niveles de alerta
    warning_min = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name='Mínimo de Advertencia',
        help_text='Valor mínimo que genera advertencia'
    )
    warning_max = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name='Máximo de Advertencia',
        help_text='Valor máximo que genera advertencia'
    )
    critical_min = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name='Mínimo Crítico',
        help_text='Valor mínimo que genera alerta crítica'
    )
    critical_max = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        null=True,
        blank=True,
        verbose_name='Máximo Crítico',
        help_text='Valor máximo que genera alerta crítica'
    )
    unit = models.CharField(
        max_length=20,
        verbose_name='Unidad',
        help_text='Unidad de medida para los umbrales'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activo',
        help_text='Determina si el umbral está activo para generar alertas'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_thresholds',
        verbose_name='Creado por'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_thresholds',
        verbose_name='Actualizado por'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(
        blank=True,
        verbose_name='Notas',
        help_text='Notas adicionales sobre la configuración del umbral'
    )

    class Meta:
        db_table = 'thresholds'
        verbose_name = 'Umbral'
        verbose_name_plural = 'Umbrales'
        ordering = ['station', 'measurement_type']
        # Un umbral por tipo de medición por estación
        unique_together = ('station', 'measurement_type')

    def __str__(self):
        return f"{self.station.name} - {self.get_measurement_type_display()}"

    def get_alert_level_for_value(self, value):
        """
        Determina el nivel de alerta para un valor dado

        Returns:
            str: 'normal', 'warning', 'critical'
        """
        if not self.is_active:
            return 'normal'

        # Verificar umbrales críticos primero
        if self.critical_min is not None and value < self.critical_min:
            return 'critical'
        if self.critical_max is not None and value > self.critical_max:
            return 'critical'

        # Verificar umbrales de advertencia
        if self.warning_min is not None and value < self.warning_min:
            return 'warning'
        if self.warning_max is not None and value > self.warning_max:
            return 'warning'

        return 'normal'


class AlertLevel(models.TextChoices):
    """Niveles de alerta del sistema"""
    INFO = 'info', 'Información'
    WARNING = 'warning', 'Advertencia'
    CRITICAL = 'critical', 'Crítico'
    EMERGENCY = 'emergency', 'Emergencia'


class AlertStatus(models.TextChoices):
    """Estados de las alertas"""
    ACTIVE = 'active', 'Activa'
    ACKNOWLEDGED = 'acknowledged', 'Reconocida'
    RESOLVED = 'resolved', 'Resuelta'
    DISMISSED = 'dismissed', 'Descartada'


class Alert(models.Model):
    """
    Modelo para sistema de alertas automáticas (RF2.5)

    Genera alertas cuando las mediciones superan los umbrales configurados
    y permite el seguimiento de su estado.
    """
    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name='alerts',
        verbose_name='Estación'
    )
    measurement = models.ForeignKey(
        Measurement,
        on_delete=models.CASCADE,
        related_name='generated_alerts',
        verbose_name='Medición',
        help_text='Medición que generó la alerta'
    )
    threshold = models.ForeignKey(
        Threshold,
        on_delete=models.CASCADE,
        related_name='alerts',
        verbose_name='Umbral',
        help_text='Umbral que fue superado'
    )
    level = models.CharField(
        max_length=20,
        choices=AlertLevel.choices,
        verbose_name='Nivel de Alerta'
    )
    status = models.CharField(
        max_length=20,
        choices=AlertStatus.choices,
        default=AlertStatus.ACTIVE,
        verbose_name='Estado'
    )
    title = models.CharField(
        max_length=200,
        verbose_name='Título',
        help_text='Título descriptivo de la alerta'
    )
    message = models.TextField(
        verbose_name='Mensaje',
        help_text='Descripción detallada de la alerta'
    )
    triggered_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Activada en',
        db_index=True
    )
    acknowledged_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Reconocida en'
    )
    acknowledged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts',
        verbose_name='Reconocida por'
    )
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Resuelta en'
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_alerts',
        verbose_name='Resuelta por'
    )
    resolution_notes = models.TextField(
        blank=True,
        verbose_name='Notas de Resolución'
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Metadatos adicionales'
    )

    class Meta:
        db_table = 'alerts'
        verbose_name = 'Alerta'
        verbose_name_plural = 'Alertas'
        ordering = ['-triggered_at']
        indexes = [
            models.Index(fields=['station', '-triggered_at']),
            models.Index(fields=['level', '-triggered_at']),
            models.Index(fields=['status', '-triggered_at']),
            models.Index(fields=['-triggered_at']),
        ]

    def __str__(self):
        return f"{self.station.name} - {self.title} ({self.get_level_display()})"

    @property
    def is_active(self):
        """Verifica si la alerta está activa"""
        return self.status == AlertStatus.ACTIVE

    @property
    def duration(self):
        """Calcula la duración de la alerta"""
        end_time = self.resolved_at or timezone.now()
        return end_time - self.triggered_at

    def acknowledge(self, user, notes=""):
        """Marca la alerta como reconocida"""
        if self.status == AlertStatus.ACTIVE:
            self.status = AlertStatus.ACKNOWLEDGED
            self.acknowledged_at = timezone.now()
            self.acknowledged_by = user
            if notes:
                self.resolution_notes = notes
            self.save(update_fields=['status', 'acknowledged_at', 'acknowledged_by', 'resolution_notes'])

    def resolve(self, user, notes=""):
        """Marca la alerta como resuelta"""
        self.status = AlertStatus.RESOLVED
        self.resolved_at = timezone.now()
        self.resolved_by = user
        if notes:
            self.resolution_notes = notes
        self.save(update_fields=['status', 'resolved_at', 'resolved_by', 'resolution_notes'])

    def dismiss(self, user, notes=""):
        """Descarta la alerta"""
        self.status = AlertStatus.DISMISSED
        self.resolved_at = timezone.now()
        self.resolved_by = user
        if notes:
            self.resolution_notes = notes
        self.save(update_fields=['status', 'resolved_at', 'resolved_by', 'resolution_notes'])


class MeasurementConfiguration(models.Model):
    """
    Configuración global para la frecuencia de mediciones y otros parámetros (RF2.2)
    """
    station = models.OneToOneField(
        Station,
        on_delete=models.CASCADE,
        related_name='measurement_config',
        verbose_name='Estación'
    )
    measurement_interval_minutes = models.PositiveIntegerField(
        default=15,
        validators=[MinValueValidator(1), MaxValueValidator(1440)],  # 1 minuto a 24 horas
        verbose_name='Intervalo de Medición (minutos)',
        help_text='Frecuencia de medición en minutos'
    )
    data_retention_days = models.PositiveIntegerField(
        default=365,
        validators=[MinValueValidator(1)],
        verbose_name='Retención de Datos (días)',
        help_text='Días para conservar los datos históricos'
    )
    auto_alerts_enabled = models.BooleanField(
        default=True,
        verbose_name='Alertas Automáticas Habilitadas'
    )
    notification_email = models.EmailField(
        blank=True,
        verbose_name='Email de Notificación',
        help_text='Email para enviar notificaciones de alertas'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'measurement_configurations'
        verbose_name = 'Configuración de Medición'
        verbose_name_plural = 'Configuraciones de Medición'

    def __str__(self):
        return f"Config {self.station.name} - {self.measurement_interval_minutes}min"
