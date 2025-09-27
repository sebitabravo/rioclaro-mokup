"""
Management command para inicializar el sistema modular
RF4.1 y RF4.3 - Configuración inicial de sensores y módulos
"""
import json
from django.core.management.base import BaseCommand
from django.db import transaction
from django.contrib.auth import get_user_model
from measurements.models_dynamic import (
    SensorTypeCategory,
    DynamicSensorType,
    ModuleConfiguration
)


class Command(BaseCommand):
    help = 'Inicializa el sistema modular con sensores y módulos por defecto'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Resetea la configuración existente',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Inicializando sistema modular...'))

        if options['reset']:
            self.stdout.write('⚠️  Reseteando configuración existente...')
            with transaction.atomic():
                ModuleConfiguration.objects.all().delete()
                DynamicSensorType.objects.all().delete()
                SensorTypeCategory.objects.all().delete()

        with transaction.atomic():
            self._create_sensor_categories()
            self._create_default_sensor_types()
            self._create_system_modules()

        self.stdout.write(self.style.SUCCESS('✅ Sistema modular inicializado exitosamente!'))

    def _create_sensor_categories(self):
        """Crea categorías de sensores por defecto"""
        self.stdout.write('📂 Creando categorías de sensores...')

        categories = [
            {
                'name': 'Calidad del Agua',
                'code': 'water-quality',
                'description': 'Sensores para medir parámetros de calidad del agua',
                'icon': 'water-drop',
                'color_code': '#2196F3'
            },
            {
                'name': 'Nivel y Flujo',
                'code': 'level-flow',
                'description': 'Sensores de nivel de agua y medición de caudal',
                'icon': 'waves',
                'color_code': '#00BCD4'
            },
            {
                'name': 'Meteorológicos',
                'code': 'meteorological',
                'description': 'Sensores meteorológicos y ambientales',
                'icon': 'cloud',
                'color_code': '#4CAF50'
            },
            {
                'name': 'Químicos',
                'code': 'chemical',
                'description': 'Sensores de parámetros químicos',
                'icon': 'science',
                'color_code': '#FF5722'
            }
        ]

        for cat_data in categories:
            category, created = SensorTypeCategory.objects.get_or_create(
                code=cat_data['code'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'  ✓ Categoría creada: {category.name}')
            else:
                self.stdout.write(f'  → Categoría existente: {category.name}')

    def _create_default_sensor_types(self):
        """Crea tipos de sensores por defecto"""
        self.stdout.write('🔧 Creando tipos de sensores por defecto...')

        # Obtener categorías
        water_quality = SensorTypeCategory.objects.get(code='water-quality')
        level_flow = SensorTypeCategory.objects.get(code='level-flow')
        meteorological = SensorTypeCategory.objects.get(code='meteorological')
        chemical = SensorTypeCategory.objects.get(code='chemical')

        sensor_types = [
            # Calidad del Agua
            {
                'name': 'Turbidez',
                'code': 'turbidity',
                'category': water_quality,
                'description': 'Sensor de turbidez del agua',
                'measurement_unit': 'NTU',
                'precision_decimals': 2,
                'min_value': 0,
                'max_value': 1000,
                'chart_type': 'line',
                'default_thresholds': {
                    'critical_max': 50,
                    'warning_max': 25
                },
                'validation_rules': {
                    'custom_range': {'min': 0, 'max': 1000}
                }
            },
            {
                'name': 'pH',
                'code': 'ph',
                'category': water_quality,
                'description': 'Sensor de pH del agua',
                'measurement_unit': 'pH',
                'precision_decimals': 2,
                'min_value': 0,
                'max_value': 14,
                'chart_type': 'line',
                'default_thresholds': {
                    'critical_min': 6,
                    'critical_max': 9,
                    'warning_min': 6.5,
                    'warning_max': 8.5
                }
            },
            {
                'name': 'Oxígeno Disuelto',
                'code': 'dissolved_oxygen',
                'category': water_quality,
                'description': 'Sensor de oxígeno disuelto',
                'measurement_unit': 'mg/L',
                'precision_decimals': 2,
                'min_value': 0,
                'max_value': 20,
                'chart_type': 'line',
                'default_thresholds': {
                    'critical_min': 4,
                    'warning_min': 6
                }
            },
            # Nivel y Flujo
            {
                'name': 'Temperatura del Agua',
                'code': 'water_temperature',
                'category': level_flow,
                'description': 'Sensor de temperatura del agua',
                'measurement_unit': '°C',
                'precision_decimals': 1,
                'min_value': -5,
                'max_value': 50,
                'chart_type': 'line',
                'default_thresholds': {
                    'critical_max': 35,
                    'warning_max': 30
                }
            },
            {
                'name': 'Caudal',
                'code': 'flow_rate',
                'category': level_flow,
                'description': 'Sensor de caudal de agua',
                'measurement_unit': 'm³/s',
                'precision_decimals': 3,
                'min_value': 0,
                'max_value': 1000,
                'chart_type': 'area'
            },
            # Meteorológicos
            {
                'name': 'Temperatura Ambiente',
                'code': 'air_temperature',
                'category': meteorological,
                'description': 'Sensor de temperatura ambiente',
                'measurement_unit': '°C',
                'precision_decimals': 1,
                'min_value': -20,
                'max_value': 60,
                'chart_type': 'line'
            },
            {
                'name': 'Humedad Relativa',
                'code': 'humidity',
                'category': meteorological,
                'description': 'Sensor de humedad relativa',
                'measurement_unit': '%',
                'precision_decimals': 1,
                'min_value': 0,
                'max_value': 100,
                'chart_type': 'gauge'
            },
            {
                'name': 'Precipitación',
                'code': 'precipitation',
                'category': meteorological,
                'description': 'Pluviómetro',
                'measurement_unit': 'mm',
                'precision_decimals': 2,
                'min_value': 0,
                'max_value': 500,
                'chart_type': 'bar'
            },
            # Químicos
            {
                'name': 'Conductividad',
                'code': 'conductivity',
                'category': chemical,
                'description': 'Sensor de conductividad eléctrica',
                'measurement_unit': 'µS/cm',
                'precision_decimals': 0,
                'min_value': 0,
                'max_value': 10000,
                'chart_type': 'line'
            },
            {
                'name': 'Nitratos',
                'code': 'nitrates',
                'category': chemical,
                'description': 'Sensor de nitratos',
                'measurement_unit': 'mg/L',
                'precision_decimals': 2,
                'min_value': 0,
                'max_value': 100,
                'chart_type': 'line',
                'default_thresholds': {
                    'critical_max': 10,
                    'warning_max': 5
                }
            }
        ]

        for sensor_data in sensor_types:
            sensor_type, created = DynamicSensorType.objects.get_or_create(
                code=sensor_data['code'],
                defaults=sensor_data
            )
            if created:
                self.stdout.write(f'  ✓ Sensor creado: {sensor_type.name}')
            else:
                self.stdout.write(f'  → Sensor existente: {sensor_type.name}')

    def _create_system_modules(self):
        """Crea módulos del sistema por defecto"""
        self.stdout.write('🧩 Creando módulos del sistema...')

        # Obtener un usuario administrativo para la auditoría
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username='system_admin',
            defaults={
                'email': 'admin@sistema.com',
                'first_name': 'Sistema',
                'last_name': 'Administrador',
                'is_staff': True,
                'is_superuser': True
            }
        )

        modules = [
            {
                'name': 'user_management',
                'display_name': 'Gestión de Usuarios',
                'version': '1.0.0',
                'description': 'Módulo de gestión de usuarios y permisos',
                'is_enabled': True,
                'is_visible': True,
                'configuration': '{}',
                'permissions_required': '[]',
                'dependencies': '[]',
                'created_by': user
            },
            {
                'name': 'station_management',
                'display_name': 'Gestión de Estaciones',
                'version': '1.0.0',
                'description': 'Módulo de gestión de estaciones de monitoreo',
                'is_enabled': True,
                'is_visible': True,
                'dependencies': '[]',
                'permissions_required': '[]',
                'configuration': '{}',
                'created_by': user
            },
            {
                'name': 'dynamic_sensors',
                'display_name': 'Sensores Dinámicos',
                'version': '1.0.0',
                'description': 'Sistema de sensores dinámicos (RF4.1)',
                'is_enabled': True,
                'is_visible': True,
                'dependencies': '[]',
                'permissions_required': '[]',
                'configuration': '{}',
                'created_by': user
            },
            {
                'name': 'module_management',
                'display_name': 'Gestión Modular',
                'version': '1.0.0',
                'description': 'Sistema de gestión de módulos (RF4.3)',
                'is_enabled': True,
                'is_visible': False,  # Solo para admins
                'dependencies': '[]',
                'permissions_required': '[]',
                'configuration': '{}',
                'created_by': user
            }
        ]

        for module_data in modules:
            module, created = ModuleConfiguration.objects.get_or_create(
                name=module_data['name'],
                defaults=module_data
            )
            if created:
                status = "✅ ACTIVO" if module.is_enabled else "❌ INACTIVO"
                self.stdout.write(f'  ✓ Módulo creado: {module.display_name} {status}')
            else:
                status = "✅ ACTIVO" if module.is_enabled else "❌ INACTIVO"
                self.stdout.write(f'  → Módulo existente: {module.display_name} {status}')
