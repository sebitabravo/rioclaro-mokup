"""
Activity Log Models for User Actions Tracking
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class ActivityLog(models.Model):
    """
    Model to track user activities and system events
    """
    
    ACTION_TYPES = [
        ('LOGIN', 'Usuario inició sesión'),
        ('LOGOUT', 'Usuario cerró sesión'),
        ('CREATE', 'Creación de registro'),
        ('UPDATE', 'Actualización de registro'),
        ('DELETE', 'Eliminación de registro'),
        ('VIEW', 'Visualización de registro'),
        ('EXPORT', 'Exportación de datos'),
        ('IMPORT', 'Importación de datos'),
        ('ALERT', 'Alerta generada'),
        ('ALERT_RESOLVED', 'Alerta resuelta'),
        ('CONFIG_CHANGE', 'Cambio de configuración'),
        ('SYSTEM', 'Evento del sistema'),
    ]
    
    ENTITY_TYPES = [
        ('USER', 'Usuario'),
        ('STATION', 'Estación'),
        ('SENSOR', 'Sensor'),
        ('MEASUREMENT', 'Medición'),
        ('ALERT', 'Alerta'),
        ('THRESHOLD', 'Umbral'),
        ('REPORT', 'Reporte'),
        ('CONFIGURATION', 'Configuración'),
        ('SYSTEM', 'Sistema'),
    ]
    
    SEVERITY_LEVELS = [
        ('INFO', 'Información'),
        ('WARNING', 'Advertencia'),
        ('ERROR', 'Error'),
        ('CRITICAL', 'Crítico'),
    ]
    
    # Core fields
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
        verbose_name='Usuario',
        help_text='Usuario que realizó la acción'
    )
    
    action_type = models.CharField(
        max_length=20,
        choices=ACTION_TYPES,
        verbose_name='Tipo de acción',
        db_index=True
    )
    
    entity_type = models.CharField(
        max_length=20,
        choices=ENTITY_TYPES,
        verbose_name='Tipo de entidad',
        db_index=True
    )
    
    entity_id = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='ID de entidad',
        help_text='ID del registro afectado'
    )
    
    severity = models.CharField(
        max_length=10,
        choices=SEVERITY_LEVELS,
        default='INFO',
        verbose_name='Severidad',
        db_index=True
    )
    
    # Description and details
    description = models.TextField(
        verbose_name='Descripción',
        help_text='Descripción de la actividad'
    )
    
    details = models.JSONField(
        null=True,
        blank=True,
        verbose_name='Detalles',
        help_text='Información adicional en formato JSON'
    )
    
    # Metadata
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='Dirección IP'
    )
    
    user_agent = models.TextField(
        null=True,
        blank=True,
        verbose_name='User Agent'
    )
    
    # Timestamps
    timestamp = models.DateTimeField(
        default=timezone.now,
        verbose_name='Fecha y hora',
        db_index=True
    )
    
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Creado en'
    )
    
    class Meta:
        verbose_name = 'Registro de Actividad'
        verbose_name_plural = 'Registros de Actividad'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp', 'action_type']),
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['severity', '-timestamp']),
        ]
    
    def __str__(self):
        user_str = self.user.email if self.user else 'Sistema'
        return f"{user_str} - {self.get_action_type_display()} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
    
    @classmethod
    def log_activity(cls, action_type, entity_type, description, user=None, 
                     entity_id=None, severity='INFO', details=None, 
                     ip_address=None, user_agent=None):
        """
        Helper method to create activity log entries
        """
        return cls.objects.create(
            user=user,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            severity=severity,
            description=description,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @classmethod
    def cleanup_old_logs(cls, days=90):
        """
        Delete activity logs older than specified days
        """
        from datetime import timedelta
        cutoff_date = timezone.now() - timedelta(days=days)
        deleted_count, _ = cls.objects.filter(timestamp__lt=cutoff_date).delete()
        return deleted_count
