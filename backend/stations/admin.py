from django.contrib import admin
from .models import Station, StationAssignment


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'latitude', 'longitude', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    ordering = ['name']
    readonly_fields = ['created_at', 'updated_at', 'has_active_sensors']

    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'code', 'description', 'is_active')
        }),
        ('Ubicación', {
            'fields': ('latitude', 'longitude')
        }),
        ('Información del Sistema', {
            'fields': ('has_active_sensors', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def has_active_sensors(self, obj):
        return obj.has_active_sensors()
    has_active_sensors.boolean = True
    has_active_sensors.short_description = 'Tiene sensores activos'


@admin.register(StationAssignment)
class StationAssignmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'station', 'assigned_at', 'assigned_by']
    list_filter = ['assigned_at', 'station']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'station__name']
    readonly_fields = ['assigned_at']

    fieldsets = (
        ('Asignación', {
            'fields': ('user', 'station', 'assigned_by')
        }),
        ('Información del Sistema', {
            'fields': ('assigned_at',),
            'classes': ('collapse',)
        }),
    )