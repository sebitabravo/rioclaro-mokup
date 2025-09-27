from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator


class Station(models.Model):
    name = models.CharField(
        max_length=100,
        verbose_name='Nombre',
        help_text="Nombre de la estación"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name='Código',
        validators=[
            RegexValidator(
                regex=r'^[A-Z0-9_]+$',
                message='El código debe contener solo letras mayúsculas, números y guiones bajos.'
            )
        ],
        help_text="Código único de la estación (ej: RIO_001)"
    )
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=8,
        verbose_name='Latitud',
        help_text="Latitud de la estación"
    )
    longitude = models.DecimalField(
        max_digits=11,
        decimal_places=8,
        verbose_name='Longitud',
        help_text="Longitud de la estación"
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name='Activa'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Relación muchos a muchos con usuarios (RF1.4)
    assigned_users = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through='StationAssignment',
        through_fields=('station', 'user'),
        related_name='assigned_stations',
        blank=True,
        verbose_name='Usuarios Asignados'
    )

    class Meta:
        db_table = 'stations'
        verbose_name = 'Estación'
        verbose_name_plural = 'Estaciones'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"

    def has_active_sensors(self):
        """Verifica si la estación tiene sensores activos (RF1.3)"""
        return self.sensors.filter(is_active=True).exists()

    @property
    def location(self):
        """Retorna la ubicación como string"""
        return f"{self.latitude}, {self.longitude}"


class StationAssignment(models.Model):
    """Modelo intermedio para la relación muchos a muchos entre usuarios y estaciones"""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Usuario'
    )
    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        verbose_name='Estación'
    )
    assigned_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Asignado en'
    )
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='station_assignments_made',
        verbose_name='Asignado por'
    )

    class Meta:
        unique_together = ('user', 'station')
        db_table = 'station_assignments'
        verbose_name = 'Asignación de Estación'
        verbose_name_plural = 'Asignaciones de Estaciones'
        ordering = ['-assigned_at']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.station.name}"