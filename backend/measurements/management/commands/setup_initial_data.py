"""Management command to setup initial data"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from stations.models import Station
from measurements.models_dynamic import SensorTypeCategory, DynamicSensorType, ModuleConfiguration

User = get_user_model()


class Command(BaseCommand):
    help = 'Setup initial data: users, stations, and sensors'

    def handle(self, *args, **options):
        self.stdout.write('🚀 Setting up initial data...\n')
        
        self.create_admin_user()
        self.create_stations()
        self.create_sensor_types()
        self.create_modules()
        
        self.stdout.write(self.style.SUCCESS('\n✅ Initial data setup complete!'))

    def create_admin_user(self):
        self.stdout.write('Creating admin user...')
        if not User.objects.filter(email='admin@rioclaro.com').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@rioclaro.com',
                password='admin123',
                first_name='Admin',
                last_name='RioClaro',
                role='ADMIN'
            )
            self.stdout.write(self.style.SUCCESS('✓ Admin user created'))
        else:
            self.stdout.write('  Admin user already exists')

    def create_stations(self):
        self.stdout.write('\nCreating stations...')
        stations_data = [
            {
                'name': 'Estación Río Norte',
                'code': 'RN-001',
                'description': 'Río Claro - Sector Norte',
                'latitude': -36.7201,
                'longitude': -71.4168,
                'is_active': True
            },
            {
                'name': 'Estación Río Sur',
                'code': 'RS-002',
                'description': 'Río Claro - Sector Sur',
                'latitude': -36.7356,
                'longitude': -71.4234,
                'is_active': True
            },
            {
                'name': 'Estación Central',
                'code': 'CE-003',
                'description': 'Río Claro - Centro',
                'latitude': -36.7289,
                'longitude': -71.4189,
                'is_active': True
            },
        ]
        
        for data in stations_data:
            station, created = Station.objects.get_or_create(
                code=data['code'],
                defaults=data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Created: {station.name}'))
            else:
                self.stdout.write(f'  Station {station.code} already exists')

    def create_sensor_types(self):
        self.stdout.write('\nCreating sensor types...')
        
        categories_data = [
            {'name': 'Calidad del Agua', 'code': 'water_quality', 'description': 'Sensores de calidad del agua'},
            {'name': 'Nivel y Caudal', 'code': 'water_level', 'description': 'Sensores de nivel y caudal'},
            {'name': 'Meteorología', 'code': 'meteorology', 'description': 'Sensores meteorológicos'},
        ]
        
        categories = {}
        for cat_data in categories_data:
            category, created = SensorTypeCategory.objects.get_or_create(
                code=cat_data['code'],
                defaults=cat_data
            )
            categories[cat_data['code']] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Category: {category.name}'))
        
        sensors_data = [
            {
                'category': categories['water_quality'],
                'name': 'Turbidez',
                'code': 'turbidity',
                'measurement_unit': 'NTU',
                'description': 'Mide la turbidez del agua',
                'min_value': '0',
                'max_value': '1000',
            },
            {
                'category': categories['water_quality'],
                'name': 'pH',
                'code': 'ph',
                'measurement_unit': 'pH',
                'description': 'Mide el pH del agua',
                'min_value': '0',
                'max_value': '14',
            },
            {
                'category': categories['water_quality'],
                'name': 'Oxígeno Disuelto',
                'code': 'dissolved_oxygen',
                'measurement_unit': 'mg/L',
                'description': 'Mide el oxígeno disuelto',
                'min_value': '0',
                'max_value': '20',
            },
            {
                'category': categories['water_level'],
                'name': 'Nivel de Agua',
                'code': 'water_level',
                'measurement_unit': 'm',
                'description': 'Mide el nivel del agua',
                'min_value': '0',
                'max_value': '10',
            },
            {
                'category': categories['water_level'],
                'name': 'Caudal',
                'code': 'flow_rate',
                'measurement_unit': 'm³/s',
                'description': 'Mide el caudal del río',
                'min_value': '0',
                'max_value': '1000',
            },
            {
                'category': categories['water_quality'],
                'name': 'Temperatura del Agua',
                'code': 'water_temperature',
                'measurement_unit': '°C',
                'description': 'Mide la temperatura del agua',
                'min_value': '-5',
                'max_value': '40',
            },
            {
                'category': categories['meteorology'],
                'name': 'Temperatura del Aire',
                'code': 'air_temperature',
                'measurement_unit': '°C',
                'description': 'Mide la temperatura del aire',
                'min_value': '-10',
                'max_value': '45',
            },
            {
                'category': categories['meteorology'],
                'name': 'Humedad',
                'code': 'humidity',
                'measurement_unit': '%',
                'description': 'Mide la humedad relativa',
                'min_value': '0',
                'max_value': '100',
            },
            {
                'category': categories['meteorology'],
                'name': 'Precipitación',
                'code': 'precipitation',
                'measurement_unit': 'mm',
                'description': 'Mide la precipitación',
                'min_value': '0',
                'max_value': '200',
            },
            {
                'category': categories['water_quality'],
                'name': 'Conductividad',
                'code': 'conductivity',
                'measurement_unit': 'µS/cm',
                'description': 'Mide la conductividad',
                'min_value': '0',
                'max_value': '5000',
            },
        ]
        
        for sensor_data in sensors_data:
            sensor, created = DynamicSensorType.objects.get_or_create(
                code=sensor_data['code'],
                defaults=sensor_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Sensor: {sensor.name}'))

    def create_modules(self):
        self.stdout.write('\nCreating module configurations...')
        
        modules_data = [
            {
                'name': 'Módulo Base',
                'code': 'base',
                'description': 'Módulo básico de monitoreo',
                'is_enabled': True,
            },
            {
                'name': 'Módulo de Alertas',
                'code': 'alerts',
                'description': 'Sistema de alertas automáticas',
                'is_enabled': True,
            },
            {
                'name': 'Módulo de Reportes',
                'code': 'reports',
                'description': 'Generación de reportes',
                'is_enabled': True,
            },
        ]
        
        for mod_data in modules_data:
            module, created = ModuleConfiguration.objects.get_or_create(
                code=mod_data['code'],
                defaults=mod_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Module: {module.name}'))
