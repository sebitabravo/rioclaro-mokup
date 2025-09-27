#!/usr/bin/env python
"""
Pruebas de los endpoints API del Módulo 4
"""
import os
import django
import requests
import json

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rioclaro_api.settings')
django.setup()


def test_api_endpoints():
    """Prueba los endpoints de la API del Módulo 4"""
    print("🌐 PRUEBAS DE API - MÓDULO 4")
    print("=" * 40)

    # Base URL - ajustar según el puerto que estés usando
    base_url = "http://localhost:8000/api/measurements/module4"

    endpoints = [
        "/sensor-categories/",
        "/dynamic-sensors/",
        "/modules/",
        "/extensible-measurements/"
    ]

    for endpoint in endpoints:
        url = base_url + endpoint
        try:
            response = requests.get(url, timeout=5)

            if response.status_code == 200:
                data = response.json()
                count = len(data.get('results', []))
                print(f"✅ {endpoint}: {count} elementos")
            else:
                print(f"⚠️  {endpoint}: Status {response.status_code}")

        except requests.exceptions.ConnectionError:
            print(f"❌ {endpoint}: Servidor no disponible")
        except Exception as e:
            print(f"❌ {endpoint}: Error {e}")

    # Probar endpoint específico del módulo 4
    try:
        url = base_url + "/system/modules-overview/"
        response = requests.get(url, timeout=5)

        if response.status_code == 200:
            print("✅ Endpoint modules-overview: OK")
        else:
            print(f"⚠️  Endpoint modules-overview: Status {response.status_code}")

    except requests.exceptions.ConnectionError:
        print("❌ Modules-overview: Servidor no disponible")
    except Exception as e:
        print(f"❌ Modules-overview: Error {e}")

    print("\nℹ️  Nota: Si ves errores de conexión, asegúrate de que el servidor Django esté ejecutándose")
    print("   Comando: python manage.py runserver")


if __name__ == '__main__':
    test_api_endpoints()
