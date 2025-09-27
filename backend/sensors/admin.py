from django.contrib import admin
from .models import Sensor, SensorReading


@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ['name', 'station', 'sensor_type', 'unit', 'is_active', 'created_at']
    list_filter = ['sensor_type', 'is_active', 'station', 'created_at']
    search_fields = ['name', 'station__name', 'station__code']
    ordering = ['station', 'name']
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Información Básica', {
            'fields': ('station', 'name', 'sensor_type', 'unit', 'is_active')
        }),
        ('Configuración', {
            'fields': ('calibration_factor',)
        }),
        ('Información del Sistema', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ['sensor', 'value', 'timestamp']
    list_filter = ['sensor__sensor_type', 'sensor__station', 'timestamp']
    search_fields = ['sensor__name', 'sensor__station__name']
    readonly_fields = ['timestamp']
    ordering = ['-timestamp']

    fieldsets = (
        ('Lectura', {
            'fields': ('sensor', 'value')
        }),
        ('Información del Sistema', {
            'fields': ('timestamp',),
            'classes': ('collapse',)
        }),
    )

    def has_add_permission(self, request):
        """Permitir agregar lecturas solo para testing"""
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        """No permitir editar lecturas"""
        return False