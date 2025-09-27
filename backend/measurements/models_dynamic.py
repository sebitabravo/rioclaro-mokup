"""
Módulo 4: Escalabilidad y Módulos Adicionales
Sistema modular para nuevos tipos de sensores y variables
"""
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.db import models
import uuid
import json


class SensorTypeCategory(models.Model):
    """
    RF4.1 - Categorías de tipos de sensores para organización modular
    """
    name = models.CharField(max_length=100, unique=True)
    code = models.SlugField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Icono para la UI")
    color_code = models.CharField(max_length=7, blank=True, help_text="Color hex para la UI")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Categoría de Sensor"
        verbose_name_plural = "Categorías de Sensores"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class DynamicSensorType(models.Model):
    """
    RF4.1 - Tipos de sensores dinámicos y extensibles
    Permite agregar nuevos tipos de sensores sin cambiar el código
    """
    # Identificación básica
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=100)
    code = models.SlugField(max_length=50, unique=True)
    category = models.ForeignKey(SensorTypeCategory, on_delete=models.CASCADE)

    # Metadatos del sensor
    description = models.TextField(blank=True)
    manufacturer = models.CharField(max_length=100, blank=True)
    model_number = models.CharField(max_length=100, blank=True)

    # Configuración técnica
    measurement_unit = models.CharField(max_length=20)
    precision_decimals = models.PositiveSmallIntegerField(default=2)
    min_value = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    max_value = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)

    # Configuración de validación personalizada
    validation_rules = models.TextField(
        default='{}',
        blank=True,
        help_text="Reglas de validación personalizadas en formato JSON"
    )

    # Configuración de UI
    display_name = models.CharField(max_length=100, blank=True)
    display_format = models.CharField(
        max_length=50,
        default='{value} {unit}',
        help_text="Formato de visualización: {value} {unit}"
    )
    chart_type = models.CharField(
        max_length=20,
        choices=[
            ('line', 'Línea'),
            ('bar', 'Barras'),
            ('area', 'Área'),
            ('gauge', 'Medidor'),
        ],
        default='line'
    )

    # Sistema modular
    is_active = models.BooleanField(default=True, help_text="RF4.3 - Control de visibilidad")
    requires_calibration = models.BooleanField(default=False)
    sampling_frequency = models.PositiveIntegerField(
        default=60,
        help_text="Frecuencia de muestreo en segundos"
    )

    # Configuración de alertas por defecto
    default_thresholds = models.TextField(
        default='{}',
        blank=True,
        help_text="Umbrales por defecto: {critical_min, critical_max, warning_min, warning_max}"
    )

    # Metadatos del sistema
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Tipo de Sensor Dinámico"
        verbose_name_plural = "Tipos de Sensores Dinámicos"
        ordering = ['category__name', 'name']

    def __str__(self):
        return f"{self.name} ({self.measurement_unit})"

    def clean(self):
        """Validaciones personalizadas"""
        if self.min_value and self.max_value and self.min_value >= self.max_value:
            raise ValidationError("El valor mínimo debe ser menor al valor máximo")

    def get_display_name(self):
        """Obtiene el nombre para mostrar"""
        return self.display_name or self.name

    def format_value(self, value):
        """Formatea un valor según la configuración del sensor"""
        formatted_value = round(float(value), self.precision_decimals)
        return self.display_format.format(
            value=formatted_value,
            unit=self.measurement_unit
        )

    def get_validation_rules(self):
        """Obtiene las reglas de validación como diccionario"""
        try:
            return json.loads(self.validation_rules) if self.validation_rules else {}
        except json.JSONDecodeError:
            return {}

    def set_validation_rules(self, rules_dict):
        """Establece las reglas de validación desde un diccionario"""
        self.validation_rules = json.dumps(rules_dict)

    def get_default_thresholds(self):
        """Obtiene los umbrales por defecto como diccionario"""
        try:
            return json.loads(self.default_thresholds) if self.default_thresholds else {}
        except json.JSONDecodeError:
            return {}

    def set_default_thresholds(self, thresholds_dict):
        """Establece los umbrales por defecto desde un diccionario"""
        self.default_thresholds = json.dumps(thresholds_dict)

    def validate_measurement_value(self, value):
        """
        Valida un valor de medición según las reglas del sensor
        """
        errors = []

        # Validación de rango básico
        if self.min_value and value < self.min_value:
            errors.append(f"Valor {value} está por debajo del mínimo {self.min_value}")

        if self.max_value and value > self.max_value:
            errors.append(f"Valor {value} está por encima del máximo {self.max_value}")

        # Validaciones personalizadas desde JSON
        validation_rules = self.get_validation_rules()
        for rule_name, rule_config in validation_rules.items():
            if rule_name == 'custom_range':
                min_val = rule_config.get('min')
                max_val = rule_config.get('max')
                if min_val and value < min_val:
                    errors.append(f"Valor no cumple rango personalizado mínimo: {min_val}")
                if max_val and value > max_val:
                    errors.append(f"Valor no cumple rango personalizado máximo: {max_val}")

        return errors


class ModuleConfiguration(models.Model):
    """
    RF4.3: Configuración de módulos del sistema
    Permite habilitar/deshabilitar funcionalidades y controlar visibilidad
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        help_text="Nombre único del módulo"
    )
    display_name = models.CharField(
        max_length=200,
        help_text="Nombre para mostrar en la interfaz"
    )
    description = models.TextField(
        blank=True,
        help_text="Descripción del módulo y su funcionalidad"
    )
    is_enabled = models.BooleanField(
        default=True,
        help_text="Si el módulo está habilitado"
    )
    is_visible = models.BooleanField(
        default=True,
        help_text="Si el módulo es visible en la interfaz"
    )
    version = models.CharField(
        max_length=20,
        default="1.0.0",
        help_text="Versión del módulo"
    )
    dependencies = models.TextField(
        default='[]',
        help_text="Lista JSON de módulos dependientes"
    )
    permissions_required = models.TextField(
        default='[]',
        help_text="Lista JSON de permisos requeridos"
    )
    configuration = models.TextField(
        default='{}',
        help_text="Configuración JSON específica del módulo"
    )

    # Configuración de orden y categorías
    order = models.IntegerField(
        default=0,
        help_text="Orden de visualización"
    )
    category = models.CharField(
        max_length=50,
        blank=True,
        help_text="Categoría del módulo"
    )

    # Campos de auditoría
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.PROTECT,
        related_name='created_modules'
    )
    updated_by = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.PROTECT,
        related_name='updated_modules',
        null=True,
        blank=True
    )

    class Meta:
        ordering = ['order', 'name']
        verbose_name = "Configuración de Módulo"
        verbose_name_plural = "Configuraciones de Módulos"

    def __str__(self):
        return f"{self.display_name} (v{self.version})"

    def get_dependencies(self):
        """Obtiene las dependencias como lista"""
        try:
            return json.loads(self.dependencies) if self.dependencies else []
        except json.JSONDecodeError:
            return []

    def set_dependencies(self, deps_list):
        """Establece las dependencias desde una lista"""
        self.dependencies = json.dumps(deps_list)

    def get_permissions_required(self):
        """Obtiene los permisos requeridos como lista"""
        try:
            return json.loads(self.permissions_required) if self.permissions_required else []
        except json.JSONDecodeError:
            return []

    def set_permissions_required(self, perms_list):
        """Establece los permisos requeridos desde una lista"""
        self.permissions_required = json.dumps(perms_list)

    def get_configuration(self):
        """Obtiene la configuración como diccionario"""
        try:
            return json.loads(self.configuration) if self.configuration else {}
        except json.JSONDecodeError:
            return {}

    def set_configuration(self, config_dict):
        """Establece la configuración desde un diccionario"""
        self.configuration = json.dumps(config_dict)

    def is_available_for_user(self, user):
        """Verifica si el módulo está disponible para un usuario"""
        if not self.is_enabled:
            return False

        if not self.is_visible:
            return False

        # Verificar permisos requeridos
        required_perms = self.get_permissions_required()
        if required_perms:
            for perm in required_perms:
                if not user.has_perm(perm):
                    return False

        # Verificar si el usuario tiene acceso específico al módulo
        if hasattr(user, 'moduleaccess_set'):
            module_access = user.moduleaccess_set.filter(module=self).exists()
            if not module_access and required_perms:
                return False

        return True

    def check_dependencies(self):
        """Verifica que todas las dependencias estén habilitadas"""
        dependencies = self.get_dependencies()
        for dep_name in dependencies:
            try:
                dep_module = ModuleConfiguration.objects.get(name=dep_name)
                if not dep_module.is_enabled:
                    return False
            except ModuleConfiguration.DoesNotExist:
                return False
        return True


class ModuleAccess(models.Model):
    """
    Tabla intermedia para controlar acceso a módulos por usuario
    """
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE)
    module = models.ForeignKey(ModuleConfiguration, on_delete=models.CASCADE)
    granted_at = models.DateTimeField(auto_now_add=True)
    granted_by = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='granted_module_accesses'
    )

    class Meta:
        unique_together = ['user', 'module']
        verbose_name = "Acceso a Módulo"
        verbose_name_plural = "Accesos a Módulos"


class ExtensibleMeasurement(models.Model):
    """
    RF4.1 - Mediciones extensibles para sensores dinámicos
    Permite almacenar mediciones de cualquier tipo de sensor
    """
    # Relación con el sensor dinámico
    sensor_type = models.ForeignKey(DynamicSensorType, on_delete=models.CASCADE)
    station = models.ForeignKey('stations.Station', on_delete=models.CASCADE)

    # Datos de la medición
    value = models.DecimalField(max_digits=15, decimal_places=6)
    timestamp = models.DateTimeField()

    # Metadatos extensibles
    metadata = models.TextField(
        default='{}',
        blank=True,
        help_text="Metadatos adicionales específicos del sensor"
    )

    # Control de calidad
    quality_flag = models.CharField(
        max_length=20,
        choices=[
            ('good', 'Buena'),
            ('questionable', 'Cuestionable'),
            ('bad', 'Mala'),
            ('estimated', 'Estimada'),
        ],
        default='good'
    )

    # Información del sistema
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Medición Extensible"
        verbose_name_plural = "Mediciones Extensibles"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['sensor_type', 'station', '-timestamp']),
            models.Index(fields=['timestamp', 'quality_flag']),
        ]

    def __str__(self):
        return f"{self.sensor_type.name}: {self.value} {self.sensor_type.measurement_unit}"

    def clean(self):
        """Validación usando las reglas del sensor dinámico"""
        errors = self.sensor_type.validate_measurement_value(self.value)
        if errors:
            raise ValidationError({"value": errors})

    def get_metadata(self):
        """Obtiene los metadatos como diccionario"""
        try:
            return json.loads(self.metadata) if self.metadata else {}
        except json.JSONDecodeError:
            return {}

    def set_metadata(self, metadata_dict):
        """Establece los metadatos desde un diccionario"""
        self.metadata = json.dumps(metadata_dict)

    def add_metadata(self, key, value):
        """Agrega un elemento a los metadatos"""
        current_metadata = self.get_metadata()
        current_metadata[key] = value
        self.set_metadata(current_metadata)

    def get_formatted_value(self):
        """Obtiene el valor formateado según el sensor"""
        return self.sensor_type.format_value(self.value)
