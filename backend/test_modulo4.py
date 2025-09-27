#!/usr/bin/env python
"""
Script de pruebas para el Módulo 4: Escalabilidad y Módulos Adicionales
RF4.1 - Sistema de Sensores Dinámicos
RF4.3 - Gestión de Módulos
"""
import os
import django
import json
from decimal import Decimal
from datetime import datetime, timezone

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rioclaro_api.settings')
django.setup()

from measurements.models_dynamic import (
    SensorTypeCategory,
    DynamicSensorType,
    ModuleConfiguration,
    ExtensibleMeasurement
)
from stations.models import Station
from users.models import CustomUser


def print_header(title):
    """Imprime un encabezado colorido"""
    print(f"\n{'='*60}")
    print(f"🧪 {title}")
    print(f"{'='*60}")


def print_success(message):
    """Imprime mensaje de éxito"""
    print(f"✅ {message}")


def print_error(message):
    """Imprime mensaje de error"""
    print(f"❌ {message}")


def print_info(message):
    """Imprime mensaje informativo"""
    print(f"ℹ️  {message}")


def test_sensor_categories():
    """Prueba RF4.1 - Categorías de Sensores"""
    print_header("RF4.1 - Pruebas de Categorías de Sensores")

    try:
        # Contar categorías existentes
        categories = SensorTypeCategory.objects.all()
        print_info(f"Categorías encontradas: {categories.count()}")

        for category in categories:
            print_info(f"  - {category.name} ({category.code})")
            sensor_count = category.dynamicsensortype_set.count()
            print_info(f"    Sensores: {sensor_count}")

        # Probar creación de nueva categoría
        test_category, created = SensorTypeCategory.objects.get_or_create(
            code='test-sensors',
            defaults={
                'name': 'Sensores de Prueba',
                'description': 'Categoría para pruebas del sistema',
                'icon': 'test-icon',
                'color_code': '#FF5722'
            }
        )

        if created:
            print_success("Nueva categoría de prueba creada exitosamente")
        else:
            print_info("Categoría de prueba ya existe")

    except Exception as e:
        print_error(f"Error en pruebas de categorías: {e}")


def test_dynamic_sensors():
    """Prueba RF4.1 - Sensores Dinámicos"""
    print_header("RF4.1 - Pruebas de Sensores Dinámicos")

    try:
        # Listar sensores existentes
        sensors = DynamicSensorType.objects.all()
        print_info(f"Sensores dinámicos encontrados: {sensors.count()}")

        for sensor in sensors:
            print_info(f"  - {sensor.name} ({sensor.code})")
            print_info(f"    Unidad: {sensor.measurement_unit}")
            print_info(f"    Rango: {sensor.min_value} - {sensor.max_value}")
            print_info(f"    Activo: {sensor.is_active}")

        # Probar creación de sensor personalizado
        category = SensorTypeCategory.objects.filter(code='test-sensors').first()
        if category:
            test_sensor, created = DynamicSensorType.objects.get_or_create(
                code='test-pressure',
                defaults={
                    'name': 'Sensor de Presión de Prueba',
                    'category': category,
                    'description': 'Sensor para pruebas del sistema dinámico',
                    'measurement_unit': 'bar',
                    'min_value': Decimal('0.0'),
                    'max_value': Decimal('100.0'),
                    'precision': 2,
                    'is_active': True,
                    'validation_rules': json.dumps({
                        'custom_range': {'min': 0, 'max': 50},
                        'precision_check': True
                    }),
                    'default_thresholds': json.dumps({
                        'warning_high': 40,
                        'critical_high': 45,
                        'warning_low': 5,
                        'critical_low': 1
                    })
                }
            )

            if created:
                print_success("Nuevo sensor dinámico creado exitosamente")

                # Probar métodos JSON
                rules = test_sensor.get_validation_rules()
                thresholds = test_sensor.get_default_thresholds()
                print_info(f"Reglas de validación: {rules}")
                print_info(f"Umbrales por defecto: {thresholds}")

                # Probar validación
                errors = test_sensor.validate_measurement_value(Decimal('25.5'))
                if not errors:
                    print_success("Validación de valor normal: OK")

                errors = test_sensor.validate_measurement_value(Decimal('60.0'))
                if errors:
                    print_success(f"Validación de valor fuera de rango: {errors}")

            else:
                print_info("Sensor de prueba ya existe")

    except Exception as e:
        print_error(f"Error en pruebas de sensores dinámicos: {e}")


def test_module_configuration():
    """Prueba RF4.3 - Configuración de Módulos"""
    print_header("RF4.3 - Pruebas de Configuración de Módulos")

    try:
        # Listar módulos existentes
        modules = ModuleConfiguration.objects.all()
        print_info(f"Módulos del sistema encontrados: {modules.count()}")

        for module in modules:
            print_info(f"  - {module.display_name}")
            print_info(f"    Nombre interno: {module.name}")
            print_info(f"    Versión: {module.version}")
            print_info(f"    Habilitado: {module.is_enabled}")
            print_info(f"    Visible: {module.is_visible}")

        # Probar creación de módulo personalizado
        user = CustomUser.objects.first()
        if user:
            test_module, created = ModuleConfiguration.objects.get_or_create(
                name='test_module',
                defaults={
                    'display_name': 'Módulo de Prueba',
                    'version': '0.1.0',
                    'description': 'Módulo para pruebas del sistema modular',
                    'is_enabled': True,
                    'is_visible': True,
                    'configuration': json.dumps({
                        'test_setting': True,
                        'max_connections': 10
                    }),
                    'permissions_required': json.dumps(['test.view_data']),
                    'dependencies': json.dumps(['user_management']),
                    'created_by': user
                }
            )

            if created:
                print_success("Nuevo módulo de prueba creado exitosamente")

                # Probar métodos JSON
                config = test_module.get_configuration()
                perms = test_module.get_permissions_required()
                deps = test_module.get_dependencies()
                print_info(f"Configuración: {config}")
                print_info(f"Permisos requeridos: {perms}")
                print_info(f"Dependencias: {deps}")

                # Probar modificación de configuración
                new_config = {'test_setting': False, 'max_connections': 20}
                test_module.set_configuration(new_config)
                test_module.save()
                print_success("Configuración modificada exitosamente")

            else:
                print_info("Módulo de prueba ya existe")

    except Exception as e:
        print_error(f"Error en pruebas de módulos: {e}")


def test_extensible_measurements():
    """Prueba RF4.1 - Mediciones Extensibles"""
    print_header("RF4.1 - Pruebas de Mediciones Extensibles")

    try:
        # Obtener sensor y estación para pruebas
        sensor = DynamicSensorType.objects.filter(is_active=True).first()
        station = Station.objects.first()

        if sensor and station:
            print_info(f"Usando sensor: {sensor.name}")
            print_info(f"Usando estación: {station.name}")

            # Crear medición extensible
            measurement = ExtensibleMeasurement.objects.create(
                sensor_type=sensor,
                station=station,
                value=Decimal('25.3'),
                timestamp=datetime.now(timezone.utc),
                metadata=json.dumps({
                    'device_id': 'TEST-001',
                    'calibration_date': '2025-09-27',
                    'ambient_temperature': 22.5
                })
            )

            print_success("Medición extensible creada exitosamente")

            # Probar métodos JSON
            metadata = measurement.get_metadata()
            print_info(f"Metadatos: {metadata}")

            # Agregar nuevo metadato
            measurement.add_metadata('test_flag', True)
            updated_metadata = measurement.get_metadata()
            print_info(f"Metadatos actualizados: {updated_metadata}")

            # Verificar validación
            if measurement.is_valid:
                print_success("Validación de medición: OK")
            else:
                print_error(f"Errores de validación: {measurement.validation_errors}")

            # Probar valor formateado
            formatted = measurement.get_formatted_value()
            print_info(f"Valor formateado: {formatted}")

        else:
            print_error("No se encontraron sensores o estaciones para pruebas")

    except Exception as e:
        print_error(f"Error en pruebas de mediciones extensibles: {e}")


def test_api_integration():
    """Prueba integración con API"""
    print_header("Pruebas de Integración con API")

    try:
        from django.test import Client
        from django.urls import reverse

        client = Client()

        # Probar endpoints de categorías de sensores
        try:
            response = client.get('/api/measurements/module4/sensor-categories/')
            if response.status_code == 200:
                print_success("Endpoint de categorías de sensores: OK")
                data = response.json()
                print_info(f"Categorías encontradas via API: {len(data.get('results', []))}")
            else:
                print_error(f"Error en endpoint de categorías: {response.status_code}")
        except Exception as e:
            print_error(f"Error al probar endpoint de categorías: {e}")

        # Probar endpoints de sensores dinámicos
        try:
            response = client.get('/api/measurements/module4/dynamic-sensors/')
            if response.status_code == 200:
                print_success("Endpoint de sensores dinámicos: OK")
                data = response.json()
                print_info(f"Sensores encontrados via API: {len(data.get('results', []))}")
            else:
                print_error(f"Error en endpoint de sensores: {response.status_code}")
        except Exception as e:
            print_error(f"Error al probar endpoint de sensores: {e}")

        # Probar endpoints de módulos
        try:
            response = client.get('/api/measurements/module4/modules/')
            if response.status_code == 200:
                print_success("Endpoint de módulos: OK")
                data = response.json()
                print_info(f"Módulos encontrados via API: {len(data.get('results', []))}")
            else:
                print_error(f"Error en endpoint de módulos: {response.status_code}")
        except Exception as e:
            print_error(f"Error al probar endpoint de módulos: {e}")

    except Exception as e:
        print_error(f"Error en pruebas de integración API: {e}")


def cleanup_test_data():
    """Limpia datos de prueba"""
    print_header("Limpieza de Datos de Prueba")

    try:
        # Eliminar mediciones de prueba
        test_measurements = ExtensibleMeasurement.objects.filter(
            metadata__icontains='TEST-001'
        )
        count = test_measurements.count()
        if count > 0:
            test_measurements.delete()
            print_success(f"Eliminadas {count} mediciones de prueba")

        # Eliminar sensor de prueba
        test_sensor = DynamicSensorType.objects.filter(code='test-pressure').first()
        if test_sensor:
            test_sensor.delete()
            print_success("Sensor de prueba eliminado")

        # Eliminar categoría de prueba
        test_category = SensorTypeCategory.objects.filter(code='test-sensors').first()
        if test_category:
            test_category.delete()
            print_success("Categoría de prueba eliminada")

        # Eliminar módulo de prueba
        test_module = ModuleConfiguration.objects.filter(name='test_module').first()
        if test_module:
            test_module.delete()
            print_success("Módulo de prueba eliminado")

    except Exception as e:
        print_error(f"Error en limpieza: {e}")


def main():
    """Ejecuta todas las pruebas"""
    print_header("INICIO DE PRUEBAS - MÓDULO 4")
    print_info("RF4.1: Sistema de Sensores Dinámicos")
    print_info("RF4.3: Gestión de Módulos")

    try:
        # Ejecutar pruebas
        test_sensor_categories()
        test_dynamic_sensors()
        test_module_configuration()
        test_extensible_measurements()
        test_api_integration()

        # Limpiar datos de prueba
        cleanup_test_data()

        print_header("RESUMEN DE PRUEBAS COMPLETADAS")
        print_success("Todas las pruebas del Módulo 4 han sido ejecutadas")
        print_info("Revise los resultados arriba para verificar el estado")

    except Exception as e:
        print_error(f"Error general en pruebas: {e}")


if __name__ == '__main__':
    main()
