#!/usr/bin/env python3
"""
Simulador de Arduino/PLC para el Sistema de Monitoreo RíoClaro
Simula sensores reales enviando datos al backend Django

Características:
- Múltiples estaciones de monitoreo
- 10 tipos de sensores dinámicos
- Datos realistas con patrones temporales
- Manejo de errores y reconexión automática
- Interfaz de línea de comandos
- Logs detallados
"""

import requests
import json
import time
import random
import math
import logging
import argparse
from datetime import datetime, timezone
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from threading import Thread, Event
import signal
import sys


# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('arduino_simulator.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class SensorConfig:
    """Configuración de un sensor"""
    name: str
    code: str
    unit: str
    min_value: float
    max_value: float
    base_value: float
    noise_factor: float
    trend_factor: float = 0.0
    daily_pattern: bool = True
    sensor_id: Optional[int] = None


@dataclass
class StationConfig:
    """Configuración de una estación de monitoreo"""
    name: str
    latitude: float
    longitude: float
    sensors: List[SensorConfig]
    station_id: Optional[int] = None


class ArduinoSimulator:
    """Simulador principal de Arduino/PLC"""

    def __init__(self, backend_url: str, auth_token: str = None):
        self.backend_url = backend_url.rstrip('/')
        self.auth_token = auth_token
        self.session = requests.Session()
        self.running = False
        self.stop_event = Event()

        # Headers para las peticiones
        self.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Arduino-Simulator/1.0'
        }

        if auth_token:
            self.headers['Authorization'] = f'Token {auth_token}'

        # Configuración de estaciones y sensores
        self.stations = self._initialize_stations()
        self.sensor_states = {}  # Estado interno de sensores para patrones

        # Configuración de simulación
        self.measurement_interval = 30  # segundos entre mediciones
        self.batch_size = 5  # mediciones por batch
        self.error_simulation = True  # simular errores ocasionales

    def _initialize_stations(self) -> List[StationConfig]:
        """Inicializa las configuraciones de estaciones"""
        return [
            StationConfig(
                name="Estación Río Norte",
                latitude=-33.4569,
                longitude=-70.6483,
                sensors=[
                    SensorConfig("Turbidez", "turbidity", "NTU", 0, 1000, 15, 0.1),
                    SensorConfig("pH", "ph", "pH", 0, 14, 7.2, 0.02),
                    SensorConfig("Oxígeno Disuelto", "dissolved_oxygen", "mg/L", 0, 20, 8.5, 0.05),
                    SensorConfig("Temperatura del Agua", "water_temperature", "°C", -5, 50, 18, 0.1),
                    SensorConfig("Caudal", "flow_rate", "m³/s", 0, 1000, 2.5, 0.08)
                ]
            ),
            StationConfig(
                name="Estación Río Sur",
                latitude=-33.5221,
                longitude=-70.6129,
                sensors=[
                    SensorConfig("Turbidez", "turbidity", "NTU", 0, 1000, 25, 0.12),
                    SensorConfig("pH", "ph", "pH", 0, 14, 6.8, 0.03),
                    SensorConfig("Conductividad", "conductivity", "µS/cm", 0, 10000, 450, 0.1),
                    SensorConfig("Temperatura Ambiente", "air_temperature", "°C", -20, 60, 22, 0.15, daily_pattern=True),
                    SensorConfig("Humedad Relativa", "humidity", "%", 0, 100, 65, 0.05, daily_pattern=True)
                ]
            ),
            StationConfig(
                name="Estación Central",
                latitude=-33.4691,
                longitude=-70.6420,
                sensors=[
                    SensorConfig("Nitratos", "nitrates", "mg/L", 0, 100, 12, 0.08),
                    SensorConfig("Precipitación", "precipitation", "mm", 0, 500, 0, 0.02),
                    SensorConfig("Temperatura del Agua", "water_temperature", "°C", -5, 50, 16, 0.12),
                    SensorConfig("Caudal", "flow_rate", "m³/s", 0, 1000, 1.8, 0.06)
                ]
            )
        ]

    def setup_backend_entities(self):
        """Configura estaciones y sensores en el backend"""
        logger.info("🔧 Configurando entidades en el backend...")

        try:
            # 1. Verificar/crear estaciones
            for station_config in self.stations:
                station_id = self._ensure_station_exists(station_config)
                station_config.station_id = station_id
                logger.info(f"✅ Estación '{station_config.name}' configurada (ID: {station_id})")

            # 2. Verificar sensores dinámicos
            self._ensure_sensors_exist()

            logger.info("✅ Backend configurado correctamente")

        except Exception as e:
            logger.error(f"❌ Error configurando backend: {e}")
            raise

    def _ensure_station_exists(self, station_config: StationConfig) -> int:
        """Asegura que la estación exista en el backend (usa estaciones existentes)"""
        try:
            response = self.session.get(
                f"{self.backend_url}/api/stations/",
                headers=self.headers
            )

            if response.status_code == 200:
                stations = response.json().get('results', [])

                if not stations:
                    raise Exception("No hay estaciones disponibles en el backend")

                # Intentar encontrar una estación con nombre similar
                for station in stations:
                    if station_config.name.lower() in station['name'].lower() or station['name'].lower() in station_config.name.lower():
                        logger.info(f"📍 Usando estación existente '{station['name']}' para {station_config.name}")
                        return station['id']

                # Si no hay coincidencia, usar la primera estación disponible
                selected_station = stations[0]
                logger.info(f"📍 Usando estación por defecto '{selected_station['name']}' para {station_config.name}")
                return selected_station['id']

            else:
                raise Exception(f"Error obteniendo estaciones: {response.status_code}")

        except Exception as e:
            logger.error(f"Error verificando estación {station_config.name}: {e}")
            raise

    def _ensure_sensors_exist(self):
        """Verifica que todos los sensores dinámicos existan"""
        try:
            # Obtener sensores existentes
            response = self.session.get(
                f"{self.backend_url}/api/measurements/module4/dynamic-sensors/",
                headers=self.headers
            )

            if response.status_code == 200:
                existing_sensors = {s['code']: s for s in response.json().get('results', [])}

                # Verificar sensores requeridos
                for station in self.stations:
                    for sensor_config in station.sensors:
                        if sensor_config.code in existing_sensors:
                            sensor_config.sensor_id = existing_sensors[sensor_config.code]['id']
                            logger.info(f"✅ Sensor {sensor_config.name} encontrado (ID: {sensor_config.sensor_id})")
                        else:
                            logger.warning(f"⚠️  Sensor {sensor_config.name} ({sensor_config.code}) no encontrado en backend")

        except Exception as e:
            logger.error(f"Error verificando sensores: {e}")

    def generate_realistic_value(self, sensor: SensorConfig, timestamp: datetime) -> float:
        """Genera un valor realista para un sensor"""
        # Obtener o inicializar estado del sensor
        sensor_key = f"{sensor.code}"
        if sensor_key not in self.sensor_states:
            self.sensor_states[sensor_key] = {
                'last_value': sensor.base_value,
                'trend': 0.0,
                'last_timestamp': timestamp
            }

        state = self.sensor_states[sensor_key]

        # Calcular valor base con patrones temporales
        base_value = sensor.base_value

        if sensor.daily_pattern:
            # Patrón diario (ej: temperatura más alta al mediodía)
            hour_factor = math.sin((timestamp.hour - 6) * math.pi / 12)
            base_value += hour_factor * (sensor.max_value - sensor.min_value) * 0.2

        # Agregar tendencia gradual
        if random.random() < 0.1:  # Cambio de tendencia 10% del tiempo
            state['trend'] = random.uniform(-sensor.trend_factor, sensor.trend_factor)

        # Calcular nuevo valor
        new_value = (
            state['last_value'] * 0.8 +  # Inercia del valor anterior
            base_value * 0.15 +           # Valor base
            state['trend'] * 0.05         # Tendencia
        )

        # Agregar ruido realista
        noise = random.gauss(0, sensor.noise_factor * (sensor.max_value - sensor.min_value))
        new_value += noise

        # Simular eventos especiales ocasionales
        if random.random() < 0.02:  # 2% probabilidad de evento especial
            if sensor.code == "turbidity":
                new_value *= random.uniform(1.5, 3.0)  # Pico de turbidez
            elif sensor.code == "precipitation":
                new_value = random.uniform(0.5, 15.0)   # Lluvia repentina
            elif sensor.code == "flow_rate":
                new_value *= random.uniform(0.5, 2.0)   # Cambio de caudal

        # Aplicar límites físicos
        new_value = max(sensor.min_value, min(sensor.max_value, new_value))

        # Actualizar estado
        state['last_value'] = new_value
        state['last_timestamp'] = timestamp

        return round(new_value, 4)

    def send_measurement(self, station_id: int, sensor_id: int, value: float, timestamp: datetime) -> bool:
        """Envía una medición al backend"""
        try:
            measurement_data = {
                'sensor_type': sensor_id,
                'station': station_id,
                'value': str(value),
                'timestamp': timestamp.isoformat(),
                'metadata': json.dumps({
                    'source': 'arduino_simulator',
                    'device_id': f'SIM-{station_id:03d}',
                    'signal_strength': random.randint(80, 100),
                    'battery_level': random.randint(85, 100)
                })
            }

            response = self.session.post(
                f"{self.backend_url}/api/measurements/module4/extensible-measurements/",
                headers=self.headers,
                json=measurement_data
            )

            if response.status_code == 201:
                return True
            else:
                logger.warning(f"⚠️  Error enviando medición: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            logger.error(f"❌ Error enviando medición: {e}")
            return False

    def simulate_station_cycle(self, station: StationConfig):
        """Simula un ciclo completo de medición para una estación"""
        if not station.station_id:
            logger.error(f"❌ Estación {station.name} no tiene ID asignado")
            return

        timestamp = datetime.now(timezone.utc)
        measurements_sent = 0

        logger.info(f"📊 Ciclo de medición - Estación: {station.name}")

        for sensor in station.sensors:
            if not sensor.sensor_id:
                logger.warning(f"⚠️  Sensor {sensor.name} no tiene ID, omitiendo...")
                continue

            # Simular error ocasional del sensor
            if self.error_simulation and random.random() < 0.05:  # 5% error rate
                logger.warning(f"⚠️  Simulando error temporal en sensor {sensor.name}")
                continue

            # Generar valor realista
            value = self.generate_realistic_value(sensor, timestamp)

            # Enviar al backend
            if self.send_measurement(station.station_id, sensor.sensor_id, value, timestamp):
                measurements_sent += 1
                logger.info(f"✅ {sensor.name}: {value} {sensor.unit}")
            else:
                logger.error(f"❌ Falló envío de {sensor.name}")

        logger.info(f"📈 Enviadas {measurements_sent}/{len(station.sensors)} mediciones")

    def start_simulation(self):
        """Inicia la simulación continua"""
        logger.info("🚀 Iniciando simulación Arduino/PLC...")
        logger.info(f"📡 Backend: {self.backend_url}")
        logger.info(f"⏱️  Intervalo: {self.measurement_interval}s")
        logger.info(f"🏭 Estaciones: {len(self.stations)}")

        self.running = True

        try:
            while not self.stop_event.wait(self.measurement_interval):
                for station in self.stations:
                    if not self.running:
                        break

                    try:
                        self.simulate_station_cycle(station)
                    except Exception as e:
                        logger.error(f"❌ Error en estación {station.name}: {e}")

                if self.running:
                    logger.info(f"⏳ Esperando {self.measurement_interval}s hasta próximo ciclo...")

        except KeyboardInterrupt:
            logger.info("🛑 Interrupción del usuario")
        except Exception as e:
            logger.error(f"❌ Error en simulación: {e}")
        finally:
            self.stop_simulation()

    def stop_simulation(self):
        """Detiene la simulación"""
        logger.info("🛑 Deteniendo simulación...")
        self.running = False
        self.stop_event.set()

    def test_connection(self) -> bool:
        """Prueba la conexión con el backend"""
        try:
            response = self.session.get(
                f"{self.backend_url}/api/measurements/module4/sensor-categories/",
                headers=self.headers,
                timeout=10
            )

            if response.status_code == 200:
                logger.info("✅ Conexión con backend exitosa")
                return True
            else:
                logger.error(f"❌ Error de conexión: {response.status_code}")
                return False

        except Exception as e:
            logger.error(f"❌ No se pudo conectar al backend: {e}")
            return False

    def send_test_burst(self, count: int = 10):
        """Envía una ráfaga de datos de prueba"""
        logger.info(f"🧪 Enviando {count} mediciones de prueba...")

        for i in range(count):
            for station in self.stations:
                if station.station_id:
                    self.simulate_station_cycle(station)

            if i < count - 1:
                time.sleep(2)  # Pausa corta entre ráfagas

        logger.info("✅ Ráfaga de prueba completada")


def signal_handler(signum, frame):
    """Maneja señales del sistema para parada elegante"""
    logger.info(f"🛑 Señal recibida ({signum}), deteniendo simulador...")
    if 'simulator' in globals():
        simulator.stop_simulation()
    sys.exit(0)


def main():
    """Función principal"""
    parser = argparse.ArgumentParser(description='Simulador Arduino/PLC para RíoClaro')
    parser.add_argument('--backend', default='http://localhost:8000',
                       help='URL del backend (default: http://localhost:8000)')
    parser.add_argument('--token', help='Token de autenticación')
    parser.add_argument('--interval', type=int, default=30,
                       help='Intervalo entre mediciones en segundos (default: 30)')
    parser.add_argument('--test-burst', type=int, metavar='N',
                       help='Enviar N ráfagas de prueba y salir')
    parser.add_argument('--no-errors', action='store_true',
                       help='Deshabilitar simulación de errores')
    parser.add_argument('--setup-only', action='store_true',
                       help='Solo configurar backend y salir')

    args = parser.parse_args()

    # Registrar manejador de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Crear simulador
    global simulator
    simulator = ArduinoSimulator(args.backend, args.token)
    simulator.measurement_interval = args.interval
    simulator.error_simulation = not args.no_errors

    try:
        # Probar conexión
        if not simulator.test_connection():
            logger.error("❌ No se pudo establecer conexión con el backend")
            return 1

        # Configurar backend
        simulator.setup_backend_entities()

        if args.setup_only:
            logger.info("✅ Configuración completada, saliendo...")
            return 0

        # Ejecutar según modo
        if args.test_burst:
            simulator.send_test_burst(args.test_burst)
        else:
            simulator.start_simulation()

    except Exception as e:
        logger.error(f"❌ Error fatal: {e}")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
