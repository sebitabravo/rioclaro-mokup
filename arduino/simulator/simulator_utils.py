#!/usr/bin/env python3
"""
Utilidades para el simulador Arduino/PLC
Scripts de configuración, testing y monitoreo
"""

import json
import time
import requests
from datetime import datetime, timezone
import argparse
import sys


def test_backend_endpoints(backend_url: str, token: str = None):
    """Prueba todos los endpoints relevantes del backend"""
    print("🔍 PROBANDO ENDPOINTS DEL BACKEND")
    print("=" * 50)

    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Token {token}'

    endpoints = [
        ('GET', '/api/stations/', 'Estaciones'),
        ('GET', '/api/measurements/module4/dynamic-sensors/', 'Sensores Dinámicos'),
        ('GET', '/api/measurements/module4/sensor-categories/', 'Categorías de Sensores'),
        ('GET', '/api/measurements/module4/modules/', 'Módulos del Sistema'),
        ('GET', '/api/measurements/module4/extensible-measurements/', 'Mediciones Extensibles')
    ]

    for method, endpoint, description in endpoints:
        try:
            url = f"{backend_url.rstrip('/')}{endpoint}"
            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                data = response.json()
                count = len(data.get('results', []))
                print(f"✅ {description}: {count} elementos")
            else:
                print(f"⚠️  {description}: Status {response.status_code}")

        except Exception as e:
            print(f"❌ {description}: Error {e}")


def create_test_station(backend_url: str, token: str = None):
    """Crea una estación de prueba"""
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Token {token}'

    station_data = {
        'name': 'Estación de Prueba Simulador',
        'location': 'Generada por simulador Arduino',
        'latitude': -33.4500,
        'longitude': -70.6500,
        'is_active': True,
        'installation_date': datetime.now(timezone.utc).isoformat()
    }

    try:
        response = requests.post(
            f"{backend_url}/api/stations/",
            headers=headers,
            json=station_data
        )

        if response.status_code == 201:
            station = response.json()
            print(f"✅ Estación de prueba creada: ID {station['id']}")
            return station['id']
        else:
            print(f"❌ Error creando estación: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"❌ Error creando estación: {e}")

    return None


def send_test_measurements(backend_url: str, station_id: int, sensor_id: int, count: int = 5, token: str = None):
    """Envía mediciones de prueba"""
    print(f"📊 Enviando {count} mediciones de prueba...")

    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Token {token}'

    for i in range(count):
        measurement_data = {
            'sensor_type': sensor_id,
            'station': station_id,
            'value': str(round(20 + i * 2.5, 2)),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'metadata': json.dumps({
                'source': 'test_script',
                'test_number': i + 1
            })
        }

        try:
            response = requests.post(
                f"{backend_url}/api/measurements/module4/extensible-measurements/",
                headers=headers,
                json=measurement_data
            )

            if response.status_code == 201:
                print(f"✅ Medición {i+1}/{count} enviada: {measurement_data['value']}")
            else:
                print(f"❌ Error en medición {i+1}: {response.status_code}")

        except Exception as e:
            print(f"❌ Error enviando medición {i+1}: {e}")

        if i < count - 1:
            time.sleep(1)


def monitor_measurements(backend_url: str, token: str = None, duration: int = 60):
    """Monitorea mediciones en tiempo real"""
    print(f"👁️  Monitoreando mediciones por {duration} segundos...")

    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Token {token}'

    start_time = time.time()
    last_count = 0

    while time.time() - start_time < duration:
        try:
            response = requests.get(
                f"{backend_url}/api/measurements/module4/extensible-measurements/",
                headers=headers
            )

            if response.status_code == 200:
                data = response.json()
                current_count = len(data.get('results', []))

                if current_count > last_count:
                    new_measurements = current_count - last_count
                    print(f"📈 +{new_measurements} nuevas mediciones (Total: {current_count})")
                    last_count = current_count

        except Exception as e:
            print(f"❌ Error monitoreando: {e}")

        time.sleep(5)  # Check every 5 seconds


def cleanup_test_data(backend_url: str, token: str = None):
    """Limpia datos de prueba del simulador"""
    print("🧹 Limpiando datos de prueba...")

    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Token {token}'

    # Buscar mediciones del simulador
    try:
        response = requests.get(
            f"{backend_url}/api/measurements/module4/extensible-measurements/",
            headers=headers,
            params={'limit': 100}
        )

        if response.status_code == 200:
            measurements = response.json().get('results', [])
            simulator_measurements = []

            for measurement in measurements:
                metadata = json.loads(measurement.get('metadata', '{}'))
                if metadata.get('source') in ['arduino_simulator', 'test_script']:
                    simulator_measurements.append(measurement['id'])

            print(f"🔍 Encontradas {len(simulator_measurements)} mediciones del simulador")

            # Eliminar mediciones (si el endpoint lo permite)
            # Nota: Esto depende de los permisos configurados en el backend
            for measurement_id in simulator_measurements[:10]:  # Limitar a 10 por seguridad
                try:
                    delete_response = requests.delete(
                        f"{backend_url}/api/measurements/module4/extensible-measurements/{measurement_id}/",
                        headers=headers
                    )
                    if delete_response.status_code == 204:
                        print(f"✅ Medición {measurement_id} eliminada")
                    else:
                        print(f"⚠️  No se pudo eliminar medición {measurement_id}: {delete_response.status_code}")
                except Exception as e:
                    print(f"❌ Error eliminando medición {measurement_id}: {e}")

    except Exception as e:
        print(f"❌ Error en limpieza: {e}")


def main():
    """Función principal para utilidades"""
    parser = argparse.ArgumentParser(description='Utilidades del simulador Arduino/PLC')
    parser.add_argument('--backend', default='http://localhost:8000',
                       help='URL del backend')
    parser.add_argument('--token', help='Token de autenticación')

    subparsers = parser.add_subparsers(dest='command', help='Comandos disponibles')

    # Test endpoints
    subparsers.add_parser('test-endpoints', help='Probar endpoints del backend')

    # Create test station
    subparsers.add_parser('create-station', help='Crear estación de prueba')

    # Send test measurements
    test_measurements = subparsers.add_parser('test-measurements', help='Enviar mediciones de prueba')
    test_measurements.add_argument('--station-id', type=int, required=True, help='ID de la estación')
    test_measurements.add_argument('--sensor-id', type=int, required=True, help='ID del sensor')
    test_measurements.add_argument('--count', type=int, default=5, help='Número de mediciones')

    # Monitor measurements
    monitor = subparsers.add_parser('monitor', help='Monitorear mediciones en tiempo real')
    monitor.add_argument('--duration', type=int, default=60, help='Duración en segundos')

    # Cleanup
    subparsers.add_parser('cleanup', help='Limpiar datos de prueba')

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    try:
        if args.command == 'test-endpoints':
            test_backend_endpoints(args.backend, args.token)

        elif args.command == 'create-station':
            create_test_station(args.backend, args.token)

        elif args.command == 'test-measurements':
            send_test_measurements(args.backend, args.station_id, args.sensor_id, args.count, args.token)

        elif args.command == 'monitor':
            monitor_measurements(args.backend, args.token, args.duration)

        elif args.command == 'cleanup':
            cleanup_test_data(args.backend, args.token)

    except KeyboardInterrupt:
        print("\n🛑 Operación interrumpida por el usuario")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
