from django.db import models
from stations.models import Station


class SensorType(models.TextChoices):
    WATER_LEVEL = 'water_level', 'Nivel de Agua'
    FLOW_RATE = 'flow_rate', 'Caudal'
    TEMPERATURE = 'temperature', 'Temperatura'
    PH = 'ph', 'pH'


class Sensor(models.Model):
    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name='sensors',
        verbose_name='Estación'
    )
    name = models.CharField(
        max_length=100,
        verbose_name='Nombre'
    )
    sensor_type = models.CharField(
        max_length=20,
        choices=SensorType.choices,
        verbose_name='Tipo de Sensor'
    )
    unit = models.CharField(
        max_length=20,
        verbose_name='Unidad',
        help_text='cm, l/s, °C, etc.'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activo'
    )
    calibration_factor = models.DecimalField(
        max_digits=10,
        decimal_places=4,
        default=1.0,
        verbose_name='Factor de Calibración'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sensors'
        verbose_name = 'Sensor'
        verbose_name_plural = 'Sensores'
        unique_together = ('station', 'sensor_type')
        ordering = ['station', 'name']

    def __str__(self):
        return f"{self.name} - {self.station.name}"


class SensorReading(models.Model):
    sensor = models.ForeignKey(
        Sensor,
        on_delete=models.CASCADE,
        related_name='readings',
        verbose_name='Sensor'
    )
    value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Valor'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha y Hora'
    )

    class Meta:
        db_table = 'sensor_readings'
        verbose_name = 'Lectura de Sensor'
        verbose_name_plural = 'Lecturas de Sensores'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.sensor.name}: {self.value} {self.sensor.unit}"