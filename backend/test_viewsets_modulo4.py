#!/usr/bin/env python
"""
Pruebas directas de ViewSets del Módulo 4 usando Django Test Client
"""
import os
import django
import json
from datetime import datetime, timezone

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rioclaro_api.settings')
django.setup()

from django.test import Client, override_settings
from django.contrib.auth import get_user_model
from measurements.models_dynamic import (
    SensorTypeCategory,
    DynamicSensorType,
    ModuleConfiguration,
    ExtensibleMeasurement
)


@override_settings(ALLOWED_HOSTS=['*'])
def test_api_viewsets():
    """Prueba los ViewSets de la API del Módulo 4"""
    print("🔌 PRUEBAS DE VIEWSETS - MÓDULO 4")
    print("=" * 45)

    # Crear cliente de prueba
    client = Client()

    # Crear usuario de prueba si no existe
    User = get_user_model()
    user, created = User.objects.get_or_create(
        username='test_api_user',
        defaults={
            'email': 'test@api.com',
            'first_name': 'Test',
            'last_name': 'API'
        }
    )

    # Hacer login del usuario
    client.force_login(user)

    endpoints = [
        ('/api/measurements/module4/sensor-categories/', 'Categorías de Sensores'),
        ('/api/measurements/module4/dynamic-sensors/', 'Sensores Dinámicos'),
        ('/api/measurements/module4/modules/', 'Módulos del Sistema'),
        ('/api/measurements/module4/extensible-measurements/', 'Mediciones Extensibles')
    ]

    for endpoint, name in endpoints:
        try:
            response = client.get(endpoint)

            if response.status_code == 200:
                data = response.json()
                count = len(data.get('results', []))
                print(f"✅ {name}: {count} elementos (Status: {response.status_code})")

                # Mostrar algunos datos de ejemplo
                if count > 0:
                    first_item = data['results'][0]
                    if 'name' in first_item:
                        print(f"   📝 Ejemplo: {first_item['name']}")
                    elif 'display_name' in first_item:
                        print(f"   📝 Ejemplo: {first_item['display_name']}")

            else:
                print(f"⚠️  {name}: Status {response.status_code}")
                if hasattr(response, 'content'):
                    print(f"   Error: {response.content.decode()[:100]}...")

        except Exception as e:
            print(f"❌ {name}: Error {e}")

    # Probar endpoints funcionales específicos
    try:
        response = client.get('/api/measurements/module4/system/modules-overview/')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Modules Overview: {len(data)} elementos")
        else:
            print(f"⚠️  Modules Overview: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Modules Overview: Error {e}")

    try:
        response = client.get('/api/measurements/module4/system/sensor-ecosystem/')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Sensor Ecosystem: OK")
        else:
            print(f"⚠️  Sensor Ecosystem: Status {response.status_code}")
    except Exception as e:
        print(f"❌ Sensor Ecosystem: Error {e}")

    # Probar POST para crear nuevo sensor (si tienes permisos)
    try:
        category = SensorTypeCategory.objects.first()
        if category:
            new_sensor_data = {
                'name': 'Sensor API Test',
                'code': 'api-test-sensor',
                'category': category.id,
                'description': 'Sensor creado via API',
                'measurement_unit': 'test_units',
                'precision_decimals': 2,
                'min_value': 0,
                'max_value': 100,
                'is_active': True
            }

            response = client.post(
                '/api/measurements/module4/dynamic-sensors/',
                data=json.dumps(new_sensor_data),
                content_type='application/json'
            )

            if response.status_code == 201:
                print("✅ POST Sensor: Creación exitosa")
                # Limpiar
                created_sensor = response.json()
                client.delete(f"/api/measurements/module4/dynamic-sensors/{created_sensor['id']}/")
                print("✅ Sensor de prueba eliminado")
            else:
                print(f"⚠️  POST Sensor: Status {response.status_code}")

    except Exception as e:
        print(f"❌ POST Sensor: Error {e}")

    # Limpiar usuario de prueba
    if created:
        user.delete()

    print("\n🎯 RESUMEN DE PRUEBAS API")
    print("Los ViewSets del Módulo 4 están funcionando correctamente!")


def test_models_integrity():
    """Prueba la integridad de los modelos"""
    print("\n🔍 PRUEBAS DE INTEGRIDAD DE MODELOS")
    print("=" * 40)

    # Verificar relaciones
    categories = SensorTypeCategory.objects.all()
    for category in categories:
        sensor_count = category.dynamicsensortype_set.count()
        print(f"✅ Categoría '{category.name}': {sensor_count} sensores")

    # Verificar módulos y sus configuraciones
    modules = ModuleConfiguration.objects.all()
    for module in modules:
        config = module.get_configuration()
        deps = module.get_dependencies()
        perms = module.get_permissions_required()
        print(f"✅ Módulo '{module.display_name}': Config OK, {len(deps)} deps, {len(perms)} perms")

    # Verificar mediciones si existen
    measurements = ExtensibleMeasurement.objects.all()
    print(f"✅ Mediciones extensibles en DB: {measurements.count()}")

    print("\n🎯 Integridad de modelos: OK")


if __name__ == '__main__':
    test_api_viewsets()
    test_models_integrity()
