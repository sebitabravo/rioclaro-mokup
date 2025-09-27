"""
Django Admin para el Módulo 4: Sistema Modular
Interfaz administrativa profesional para gestión de sensores y módulos
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
import json

from .models_dynamic import (
    SensorTypeCategory,
    DynamicSensorType,
    ModuleConfiguration,
    ModuleAccess,
    ExtensibleMeasurement
)


@admin.register(SensorTypeCategory)
class SensorTypeCategoryAdmin(admin.ModelAdmin):
    """
    Admin para categorías de sensores
    """
    list_display = [
        'name', 'code', 'sensor_types_count', 'color_display',
        'is_active', 'created_at'
    ]
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'code', 'description']
    prepopulated_fields = {'code': ('name',)}
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'code', 'description')
        }),
        ('Configuración de UI', {
            'fields': ('icon', 'color_code', 'is_active')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def sensor_types_count(self, obj):
        """Cuenta tipos de sensores en esta categoría"""
        count = obj.dynamicsensortype_set.count()
        if count > 0:
            url = reverse('admin:measurements_dynamicsensortype_changelist')
            return format_html(
                '<a href="{}?category__id={}">{} sensores</a>',
                url, obj.id, count
            )
        return '0 sensores'
    sensor_types_count.short_description = 'Tipos de Sensores'

    def color_display(self, obj):
        """Muestra el color como preview"""
        if obj.color_code:
            return format_html(
                '<div style="width: 20px; height: 20px; background-color: {}; border: 1px solid #ccc;"></div>',
                obj.color_code
            )
        return '-'
    color_display.short_description = 'Color'


@admin.register(DynamicSensorType)
class DynamicSensorTypeAdmin(admin.ModelAdmin):
    """
    Admin para tipos de sensores dinámicos
    """
    list_display = [
        'name', 'code', 'category', 'measurement_unit', 'is_active',
        'measurements_count', 'created_at'
    ]
    list_filter = [
        'category', 'is_active', 'requires_calibration',
        'chart_type', 'created_at'
    ]
    search_fields = ['name', 'code', 'description', 'manufacturer', 'model_number']
    prepopulated_fields = {'code': ('name',)}
    readonly_fields = ['uuid', 'created_at', 'updated_at', 'created_by']

    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'code', 'category', 'description')
        }),
        ('Especificaciones Técnicas', {
            'fields': (
                'manufacturer', 'model_number', 'measurement_unit',
                'precision_decimals', 'min_value', 'max_value'
            )
        }),
        ('Configuración de Validación', {
            'fields': ('validation_rules', 'default_thresholds'),
            'classes': ('collapse',)
        }),
        ('Configuración de UI', {
            'fields': ('display_name', 'display_format', 'chart_type')
        }),
        ('Sistema Modular', {
            'fields': ('is_active', 'requires_calibration', 'sampling_frequency')
        }),
        ('Metadatos', {
            'fields': ('uuid', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        })
    )

    def measurements_count(self, obj):
        """Cuenta mediciones de este tipo de sensor"""
        count = obj.extensiblemeasurement_set.count()
        if count > 0:
            url = reverse('admin:measurements_extensiblemeasurement_changelist')
            return format_html(
                '<a href="{}?sensor_type__id={}">{} mediciones</a>',
                url, obj.id, count
            )
        return '0 mediciones'
    measurements_count.short_description = 'Mediciones'

    def save_model(self, request, obj, form, change):
        """Asigna el usuario creador"""
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    actions = ['activate_sensors', 'deactivate_sensors']

    def activate_sensors(self, request, queryset):
        """Activa sensores seleccionados"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} tipos de sensores activados.')
    activate_sensors.short_description = "Activar sensores seleccionados"

    def deactivate_sensors(self, request, queryset):
        """Desactiva sensores seleccionados"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} tipos de sensores desactivados.')
    deactivate_sensors.short_description = "Desactivar sensores seleccionados"


class ModuleAccessInline(admin.TabularInline):
    """
    Inline para gestionar accesos a módulos
    """
    model = ModuleAccess
    extra = 0
    readonly_fields = ['granted_at', 'granted_by']

    def save_model(self, request, obj, form, change):
        """Asigna quien otorgó el acceso"""
        if not change and not obj.granted_by:
            obj.granted_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ModuleConfiguration)
class ModuleConfigurationAdmin(admin.ModelAdmin):
    """
    Admin para configuración de módulos
    """
    list_display = [
        'name', 'display_name', 'version', 'status_display',
        'dependencies_status', 'created_at'
    ]
    list_filter = ['is_enabled', 'is_visible', 'created_at']
    search_fields = ['name', 'display_name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    inlines = [ModuleAccessInline]

    fieldsets = (
        ('Información del Módulo', {
            'fields': ('name', 'display_name', 'version', 'description')
        }),
        ('Estado del Módulo', {
            'fields': ('is_enabled', 'is_visible', 'order', 'category')
        }),
        ('Configuración Avanzada', {
            'fields': ('dependencies', 'permissions_required', 'configuration'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        })
    )

    def status_display(self, obj):
        """Muestra el estado del módulo con colores"""
        if obj.is_enabled and obj.is_visible_to_users:
            return format_html(
                '<span style="color: green;">✅ Activo y Visible</span>'
            )
        elif obj.is_enabled:
            return format_html(
                '<span style="color: orange;">⚠️ Activo (Oculto)</span>'
            )
        else:
            return format_html(
                '<span style="color: red;">❌ Inactivo</span>'
            )
    status_display.short_description = 'Estado'

    def dependencies_status(self, obj):
        """Muestra el estado de las dependencias"""
        if not obj.dependencies:
            return '✅ Sin dependencias'

        satisfied = 0
        total = len(obj.dependencies)

        for dep_code in obj.dependencies:
            try:
                dep = ModuleConfiguration.objects.get(code=dep_code)
                if dep.is_enabled:
                    satisfied += 1
            except ModuleConfiguration.DoesNotExist:
                pass

        if satisfied == total:
            return format_html('<span style="color: green;">✅ {}/{}</span>', satisfied, total)
        else:
            return format_html('<span style="color: red;">❌ {}/{}</span>', satisfied, total)
    dependencies_status.short_description = 'Dependencias'

    def users_count(self, obj):
        """Cuenta usuarios con acceso al módulo"""
        count = obj.moduleaccess_set.count()
        if count > 0:
            return f'{count} usuarios'
        return 'Sin usuarios'
    users_count.short_description = 'Usuarios'

    def save_model(self, request, obj, form, change):
        """Asigna el usuario creador"""
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    actions = ['enable_modules', 'disable_modules', 'make_visible', 'make_hidden']

    def enable_modules(self, request, queryset):
        """Habilita módulos seleccionados"""
        count = queryset.update(is_enabled=True)
        self.message_user(request, f'{count} módulos habilitados.')
    enable_modules.short_description = "Habilitar módulos seleccionados"

    def disable_modules(self, request, queryset):
        """Deshabilita módulos seleccionados"""
        count = queryset.update(is_enabled=False)
        self.message_user(request, f'{count} módulos deshabilitados.')
    disable_modules.short_description = "Deshabilitar módulos seleccionados"

    def make_visible(self, request, queryset):
        """Hace visibles los módulos seleccionados"""
        count = queryset.update(is_visible_to_users=True)
        self.message_user(request, f'{count} módulos visibles para usuarios.')
    make_visible.short_description = "Hacer visibles a usuarios"

    def make_hidden(self, request, queryset):
        """Oculta los módulos seleccionados"""
        count = queryset.update(is_visible_to_users=False)
        self.message_user(request, f'{count} módulos ocultos para usuarios.')
    make_hidden.short_description = "Ocultar a usuarios"


@admin.register(ExtensibleMeasurement)
class ExtensibleMeasurementAdmin(admin.ModelAdmin):
    """
    Admin para mediciones extensibles
    """
    list_display = [
        'sensor_type', 'station', 'formatted_value_display',
        'quality_flag', 'timestamp', 'created_at'
    ]
    list_filter = [
        'sensor_type__category', 'sensor_type', 'quality_flag',
        'timestamp', 'created_at'
    ]
    search_fields = [
        'sensor_type__name', 'station__name', 'station__code'
    ]
    readonly_fields = ['created_at', 'created_by']
    date_hierarchy = 'timestamp'

    fieldsets = (
        ('Información de la Medición', {
            'fields': ('sensor_type', 'station', 'value', 'timestamp')
        }),
        ('Control de Calidad', {
            'fields': ('quality_flag',)
        }),
        ('Metadatos Adicionales', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Sistema', {
            'fields': ('created_at', 'created_by'),
            'classes': ('collapse',)
        })
    )

    def formatted_value_display(self, obj):
        """Muestra el valor formateado"""
        return obj.get_formatted_value()
    formatted_value_display.short_description = 'Valor'

    def save_model(self, request, obj, form, change):
        """Asigna el usuario creador"""
        if not change and not obj.created_by:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def get_queryset(self, request):
        """Optimiza consultas con select_related"""
        return super().get_queryset(request).select_related(
            'sensor_type', 'sensor_type__category', 'station', 'created_by'
        )


# Personalización del sitio admin
admin.site.site_header = "Rio Claro - Sistema Modular"
admin.site.site_title = "Administración Modular"
admin.site.index_title = "Panel de Administración - Módulo 4"
