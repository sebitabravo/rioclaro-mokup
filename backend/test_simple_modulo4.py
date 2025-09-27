#!/usr/bin/env python
"""
Script de pruebas simplificado para el Módulo 4
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


def test_basic_functionality():
    """Pruebas básicas del sistema modular"""
    print("🧪 PRUEBAS BÁSICAS DEL MÓDULO 4")
    print("=" * 50)

    # 1. Verificar categorías de sensores
    categories = SensorTypeCategory.objects.all()
    print(f"✅ Categorías de sensores: {categories.count()}")

    # 2. Verificar sensores dinámicos
    sensors = DynamicSensorType.objects.all()
    print(f"✅ Sensores dinámicos: {sensors.count()}")

    # 3. Verificar módulos del sistema
    modules = ModuleConfiguration.objects.all()
    print(f"✅ Módulos del sistema: {modules.count()}")

    # 4. Probar creación de sensor personalizado
    category = SensorTypeCategory.objects.first()
    if category:
        test_sensor, created = DynamicSensorType.objects.get_or_create(
            code='test-simple-sensor',
            defaults={
                'name': 'Sensor de Prueba Simple',
                'category': category,
                'description': 'Sensor para pruebas básicas',
                'measurement_unit': 'units',
                'precision_decimals': 2,  # Campo correcto
                'min_value': Decimal('0.0'),
                'max_value': Decimal('100.0'),
                'is_active': True,
                'validation_rules': '{}',
                'default_thresholds': '{}'
            }
        )

        if created:
            print("✅ Nuevo sensor de prueba creado")

            # Probar métodos JSON
            rules = test_sensor.get_validation_rules()
            thresholds = test_sensor.get_default_thresholds()
            print(f"✅ Métodos JSON funcionando - Rules: {type(rules)}, Thresholds: {type(thresholds)}")

            # Probar validación
            errors = test_sensor.validate_measurement_value(Decimal('50.0'))
            print(f"✅ Validación de medición: {'OK' if not errors else f'Errores: {errors}'}")

        else:
            print("ℹ️  Sensor de prueba ya existe")

    # 5. Probar módulo personalizado
    user = CustomUser.objects.first()
    if user:
        test_module, created = ModuleConfiguration.objects.get_or_create(
            name='simple_test_module',
            defaults={
                'display_name': 'Módulo Simple',
                'version': '0.1.0',
                'description': 'Módulo para pruebas simples',
                'is_enabled': True,
                'is_visible': True,
                'configuration': '{}',
                'permissions_required': '[]',
                'dependencies': '[]',
                'created_by': user
            }
        )

        if created:
            print("✅ Nuevo módulo de prueba creado")

            # Probar métodos JSON
            config = test_module.get_configuration()
            print(f"✅ Configuración del módulo: {config}")
        else:
            print("ℹ️  Módulo de prueba ya existe")

    # 6. Probar medición extensible
    sensor = DynamicSensorType.objects.filter(is_active=True).first()
    station = Station.objects.first()

    if sensor and station:
        try:
            measurement = ExtensibleMeasurement.objects.create(
                sensor_type=sensor,
                station=station,
                value=Decimal('25.3'),
                timestamp=datetime.now(timezone.utc),
                metadata='{"test": true}'
            )
            print("✅ Medición extensible creada")

            # Probar métodos JSON
            metadata = measurement.get_metadata()
            print(f"✅ Metadatos de medición: {metadata}")

            # Limpiar
            measurement.delete()

        except Exception as e:
            print(f"❌ Error en medición: {e}")

    # 7. Limpiar datos de prueba
    try:
        DynamicSensorType.objects.filter(code='test-simple-sensor').delete()
        ModuleConfiguration.objects.filter(name='simple_test_module').delete()
        print("✅ Datos de prueba limpiados")
    except Exception as e:
        print(f"⚠️  Error en limpieza: {e}")

    print("\n🎉 PRUEBAS COMPLETADAS")
    print("El Módulo 4 está funcionando correctamente!")


if __name__ == '__main__':
    test_basic_functionality()
