from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Measurement,
    Threshold,
    Alert,
    MeasurementConfiguration
)


@admin.register(Measurement)
class MeasurementAdmin(admin.ModelAdmin):
    """
    Administrador para el modelo Measurement
    """
    list_display = [
        'id', 'station', 'sensor', 'measurement_type',
        'value', 'unit', 'quality_flag', 'timestamp', 'is_recent_badge'
    ]
    list_filter = [
        'measurement_type', 'quality_flag', 'station',
        'timestamp', 'received_at'
    ]
    search_fields = [
        'station__name', 'station__code', 'sensor__name',
        'measurement_type'
    ]
    readonly_fields = ['received_at', 'is_recent_badge']
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    list_per_page = 50

    fieldsets = (
        ('Información básica', {
            'fields': ('station', 'sensor', 'measurement_type')
        }),
        ('Datos de medición', {
            'fields': ('value', 'raw_value', 'unit', 'quality_flag')
        }),
        ('Temporal', {
            'fields': ('timestamp', 'received_at')
        }),
        ('Metadatos', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )

    def is_recent_badge(self, obj):
        """Muestra un badge si la medición es reciente"""
        if obj.is_recent():
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Reciente</span>'
            )
        return format_html(
            '<span style="color: gray;">○ Antigua</span>'
        )
    is_recent_badge.short_description = 'Estado'

    def get_queryset(self, request):
        """Optimizar consultas con select_related"""
        return super().get_queryset(request).select_related(
            'station', 'sensor'
        )


@admin.register(Threshold)
class ThresholdAdmin(admin.ModelAdmin):
    """
    Administrador para el modelo Threshold
    """
    list_display = [
        'station', 'measurement_type', 'warning_range',
        'critical_range', 'is_active', 'created_by', 'updated_at'
    ]
    list_filter = [
        'measurement_type', 'is_active', 'station',
        'created_at', 'updated_at'
    ]
    search_fields = [
        'station__name', 'station__code', 'measurement_type',
        'notes'
    ]
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['station', 'measurement_type']

    fieldsets = (
        ('Configuración básica', {
            'fields': ('station', 'measurement_type', 'unit', 'is_active')
        }),
        ('Umbrales de advertencia', {
            'fields': ('warning_min', 'warning_max')
        }),
        ('Umbrales críticos', {
            'fields': ('critical_min', 'critical_max')
        }),
        ('Auditoría', {
            'fields': ('created_by', 'updated_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Notas', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )

    def warning_range(self, obj):
        """Muestra el rango de advertencia de forma legible"""
        parts = []
        if obj.warning_min is not None:
            parts.append(f"min: {obj.warning_min}")
        if obj.warning_max is not None:
            parts.append(f"max: {obj.warning_max}")
        return " | ".join(parts) if parts else "-"
    warning_range.short_description = 'Rango Advertencia'

    def critical_range(self, obj):
        """Muestra el rango crítico de forma legible"""
        parts = []
        if obj.critical_min is not None:
            parts.append(f"min: {obj.critical_min}")
        if obj.critical_max is not None:
            parts.append(f"max: {obj.critical_max}")
        return " | ".join(parts) if parts else "-"
    critical_range.short_description = 'Rango Crítico'

    def save_model(self, request, obj, form, change):
        """Asignar usuario al crear/actualizar"""
        if not change:  # Creando nuevo objeto
            obj.created_by = request.user
        obj.updated_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    """
    Administrador para el modelo Alert
    """
    list_display = [
        'id', 'station', 'level_badge', 'status_badge',
        'title', 'triggered_at', 'duration_display', 'acknowledged_by'
    ]
    list_filter = [
        'level', 'status', 'station',
        'triggered_at', 'acknowledged_at', 'resolved_at'
    ]
    search_fields = [
        'station__name', 'title', 'message',
        'threshold__measurement_type'
    ]
    readonly_fields = [
        'triggered_at', 'duration_display', 'measurement_link'
    ]
    date_hierarchy = 'triggered_at'
    ordering = ['-triggered_at']
    list_per_page = 25

    fieldsets = (
        ('Información básica', {
            'fields': ('station', 'level', 'status', 'title')
        }),
        ('Detalles', {
            'fields': ('message', 'measurement_link', 'threshold')
        }),
        ('Temporal', {
            'fields': ('triggered_at', 'duration_display')
        }),
        ('Gestión', {
            'fields': (
                'acknowledged_at', 'acknowledged_by',
                'resolved_at', 'resolved_by', 'resolution_notes'
            ),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
    )

    def level_badge(self, obj):
        """Muestra el nivel con colores"""
        colors = {
            'info': '#17a2b8',
            'warning': '#ffc107',
            'critical': '#dc3545',
            'emergency': '#6f42c1'
        }
        color = colors.get(obj.level, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_level_display()
        )
    level_badge.short_description = 'Nivel'

    def status_badge(self, obj):
        """Muestra el estado con colores"""
        colors = {
            'active': '#dc3545',
            'acknowledged': '#ffc107',
            'resolved': '#28a745',
            'dismissed': '#6c757d'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Estado'

    def duration_display(self, obj):
        """Muestra la duración de forma legible"""
        duration = obj.duration
        if duration.days > 0:
            return f"{duration.days} días"
        hours = duration.seconds // 3600
        if hours > 0:
            return f"{hours} horas"
        minutes = duration.seconds // 60
        return f"{minutes} minutos"
    duration_display.short_description = 'Duración'

    def measurement_link(self, obj):
        """Enlace a la medición que generó la alerta"""
        if obj.measurement:
            url = reverse('admin:measurements_measurement_change', args=[obj.measurement.id])
            return format_html(
                '<a href="{}">Medición #{} - {} {}</a>',
                url,
                obj.measurement.id,
                obj.measurement.value,
                obj.measurement.unit
            )
        return "-"
    measurement_link.short_description = 'Medición'

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related(
            'station', 'measurement', 'threshold',
            'acknowledged_by', 'resolved_by'
        )

    actions = ['mark_as_acknowledged', 'mark_as_resolved']

    def mark_as_acknowledged(self, request, queryset):
        """Acción para marcar alertas como reconocidas"""
        updated = 0
        for alert in queryset.filter(status='active'):
            alert.acknowledge(request.user, "Reconocida desde admin")
            updated += 1
        self.message_user(
            request,
            f"Se reconocieron {updated} alertas exitosamente."
        )
    mark_as_acknowledged.short_description = "Reconocer alertas seleccionadas"

    def mark_as_resolved(self, request, queryset):
        """Acción para marcar alertas como resueltas"""
        updated = 0
        for alert in queryset.exclude(status='resolved'):
            alert.resolve(request.user, "Resuelta desde admin")
            updated += 1
        self.message_user(
            request,
            f"Se resolvieron {updated} alertas exitosamente."
        )
    mark_as_resolved.short_description = "Resolver alertas seleccionadas"


@admin.register(MeasurementConfiguration)
class MeasurementConfigurationAdmin(admin.ModelAdmin):
    """
    Administrador para el modelo MeasurementConfiguration
    """
    list_display = [
        'station', 'measurement_interval_minutes',
        'data_retention_days', 'auto_alerts_enabled',
        'notification_email', 'updated_at'
    ]
    list_filter = [
        'auto_alerts_enabled', 'measurement_interval_minutes',
        'created_at', 'updated_at'
    ]
    search_fields = [
        'station__name', 'station__code', 'notification_email'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Estación', {
            'fields': ('station',)
        }),
        ('Configuración de mediciones', {
            'fields': (
                'measurement_interval_minutes',
                'data_retention_days',
                'auto_alerts_enabled'
            )
        }),
        ('Notificaciones', {
            'fields': ('notification_email',)
        }),
        ('Auditoría', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        """Optimizar consultas"""
        return super().get_queryset(request).select_related('station')


# Personalización del admin site
admin.site.site_header = "Sistema de Monitoreo Río Claro - Administración"
admin.site.site_title = "Río Claro Admin"
admin.site.index_title = "Panel de Administración"

# ========================================
# MÓDULO 4: IMPORTAR ADMIN MODULAR
# ========================================
# Importar el admin del sistema modular
from . import admin_dynamic
