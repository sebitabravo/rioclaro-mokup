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
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple
from threading import Thread, Event
from enum import Enum
import signal
import sys


class WeatherEvent(Enum):
    """Eventos climáticos que afectan las mediciones"""
    NORMAL = "normal"
    RAIN = "rain"
    STORM = "storm"
    DROUGHT = "drought"
    HEATWAVE = "heatwave"
    FLOOD = "flood"


class SeasonalPattern(Enum):
    """Patrones estacionales"""
    SUMMER = "summer"
    AUTUMN = "autumn"
    WINTER = "winter"
    SPRING = "spring"


@dataclass
class WeatherState:
    """Estado climático actual"""
    event: WeatherEvent = WeatherEvent.NORMAL
    intensity: float = 1.0  # 0.0 a 1.0
    duration_hours: int = 0
    start_time: Optional[datetime] = None


@dataclass
class SensorState:
    """Estado interno de un sensor con memoria histórica"""
    last_value: float
    trend: float = 0.0
    last_timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    event_modifier: float = 1.0
    seasonal_modifier: float = 1.0
    correlation_factors: Dict[str, float] = field(default_factory=dict)


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

    def __init__(self, backend_url: str, auth_token: Optional[str] = None):
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
        self.sensor_states: Dict[str, SensorState] = {}  # Estado interno de sensores para patrones

        # Estado climático y estacional
        self.weather_state = WeatherState()
        self.current_season = self._get_current_season()
        self.last_weather_check = datetime.now(timezone.utc)

        # Estadísticas de simulación
        self.stats = {
            'measurements_sent': 0,
            'errors': 0,
            'events_triggered': 0,
            'start_time': datetime.now(timezone.utc)
        }

        # Configuración de simulación
        self.measurement_interval = 30  # segundos entre mediciones
        self.batch_size = 5  # mediciones por batch
        self.error_simulation = True  # simular errores ocasionales
        self.weather_simulation = True  # simular eventos climáticos

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

    def _get_current_season(self) -> SeasonalPattern:
        """Determina la temporada actual basada en la fecha"""
        month = datetime.now().month
        if month in [12, 1, 2]:
            return SeasonalPattern.SUMMER
        elif month in [3, 4, 5]:
            return SeasonalPattern.AUTUMN
        elif month in [6, 7, 8]:
            return SeasonalPattern.WINTER
        else:
            return SeasonalPattern.SPRING

    def _update_weather_state(self):
        """Actualiza el estado climático (llamado periódicamente)"""
        now = datetime.now(timezone.utc)

        # Verificar si necesitamos cambiar el clima
        if (now - self.last_weather_check).total_seconds() > 3600:  # Cada hora
            self.last_weather_check = now

            # Probabilidades de eventos climáticos
            rand = random.random()
            if rand < 0.7:  # 70% normal
                self.weather_state = WeatherState()
            elif rand < 0.8:  # 10% lluvia
                self.weather_state = WeatherState(
                    event=WeatherEvent.RAIN,
                    intensity=random.uniform(0.3, 0.8),
                    duration_hours=random.randint(1, 6),
                    start_time=now
                )
            elif rand < 0.85:  # 5% tormenta
                self.weather_state = WeatherState(
                    event=WeatherEvent.STORM,
                    intensity=random.uniform(0.6, 1.0),
                    duration_hours=random.randint(2, 12),
                    start_time=now
                )
            elif rand < 0.9:  # 5% sequía
                self.weather_state = WeatherState(
                    event=WeatherEvent.DROUGHT,
                    intensity=random.uniform(0.4, 0.7),
                    duration_hours=random.randint(24, 168),  # 1-7 días
                    start_time=now
                )
            elif rand < 0.95:  # 5% ola de calor
                self.weather_state = WeatherState(
                    event=WeatherEvent.HEATWAVE,
                    intensity=random.uniform(0.5, 0.9),
                    duration_hours=random.randint(12, 72),
                    start_time=now
                )
            else:  # 5% inundación
                self.weather_state = WeatherState(
                    event=WeatherEvent.FLOOD,
                    intensity=random.uniform(0.7, 1.0),
                    duration_hours=random.randint(6, 48),
                    start_time=now
                )

            if self.weather_state.event != WeatherEvent.NORMAL:
                logger.info(f"🌤️  Evento climático: {self.weather_state.event.value} "
                          f"(intensidad: {self.weather_state.intensity:.1f}, "
                          f"duración: {self.weather_state.duration_hours}h)")
                self.stats['events_triggered'] += 1

        # Verificar si el evento actual terminó
        if (self.weather_state.event != WeatherEvent.NORMAL and
            self.weather_state.start_time and
            (now - self.weather_state.start_time).total_seconds() > self.weather_state.duration_hours * 3600):
            logger.info(f"🌤️  Evento {self.weather_state.event.value} terminó")
            self.weather_state = WeatherState()

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
        """Genera un valor realista para un sensor con patrones climáticos y estacionales"""
        # Obtener o inicializar estado del sensor
        sensor_key = f"{sensor.code}"
        if sensor_key not in self.sensor_states:
            self.sensor_states[sensor_key] = SensorState(
                last_value=sensor.base_value,
                trend=0.0,
                last_timestamp=timestamp
            )

        state = self.sensor_states[sensor_key]

        # Calcular modificadores climáticos y estacionales
        weather_modifier = self._calculate_weather_modifier(sensor)
        seasonal_modifier = self._calculate_seasonal_modifier(sensor)

        # Actualizar modificadores en el estado
        state.event_modifier = weather_modifier
        state.seasonal_modifier = seasonal_modifier

        # Calcular valor base con patrones temporales
        base_value = sensor.base_value * seasonal_modifier

        if sensor.daily_pattern:
            # Patrón diario (ej: temperatura más alta al mediodía)
            hour_factor = math.sin((timestamp.hour - 6) * math.pi / 12)
            base_value += hour_factor * (sensor.max_value - sensor.min_value) * 0.2

        # Agregar tendencia gradual
        if random.random() < 0.1:  # Cambio de tendencia 10% del tiempo
            state.trend = random.uniform(-sensor.trend_factor, sensor.trend_factor)

        # Calcular nuevo valor con inercia y modificadores
        new_value = (
            state.last_value * 0.75 +      # Mayor inercia
            base_value * 0.2 +             # Valor base
            state.trend * 0.05            # Tendencia
        )

        # Aplicar modificador climático
        new_value *= weather_modifier

        # Agregar ruido realista
        noise = random.gauss(0, sensor.noise_factor * (sensor.max_value - sensor.min_value))
        new_value += noise

        # Simular correlaciones entre sensores
        new_value += self._calculate_sensor_correlations(sensor, new_value)

        # Eventos especiales basados en clima
        new_value = self._apply_weather_events(sensor, new_value, timestamp)

        # Aplicar límites físicos
        new_value = max(sensor.min_value, min(sensor.max_value, new_value))

        # Actualizar estado
        state.last_value = new_value
        state.last_timestamp = timestamp

        return round(new_value, 4)

    def _calculate_weather_modifier(self, sensor: SensorConfig) -> float:
        """Calcula cómo afecta el clima actual al sensor"""
        if self.weather_state.event == WeatherEvent.NORMAL:
            return 1.0

        intensity = self.weather_state.intensity

        if sensor.code in ["precipitation", "humidity"]:
            if self.weather_state.event in [WeatherEvent.RAIN, WeatherEvent.STORM]:
                return 1.0 + (intensity * 3.0)  # Hasta 4x más lluvia
            elif self.weather_state.event == WeatherEvent.DROUGHT:
                return max(0.1, 1.0 - (intensity * 0.8))  # Hasta 80% menos

        elif sensor.code in ["water_temperature", "air_temperature"]:
            if self.weather_state.event == WeatherEvent.HEATWAVE:
                return 1.0 + (intensity * 0.3)  # Hasta 30% más calor
            elif self.weather_state.event in [WeatherEvent.RAIN, WeatherEvent.STORM]:
                return 1.0 - (intensity * 0.2)  # Hasta 20% más frío

        elif sensor.code == "flow_rate":
            if self.weather_state.event in [WeatherEvent.RAIN, WeatherEvent.STORM, WeatherEvent.FLOOD]:
                return 1.0 + (intensity * 2.0)  # Hasta 3x más caudal
            elif self.weather_state.event == WeatherEvent.DROUGHT:
                return max(0.3, 1.0 - (intensity * 0.6))  # Hasta 70% menos caudal

        elif sensor.code == "turbidity":
            if self.weather_state.event in [WeatherEvent.RAIN, WeatherEvent.STORM, WeatherEvent.FLOOD]:
                return 1.0 + (intensity * 1.5)  # Hasta 2.5x más turbidez

        return 1.0

    def _calculate_seasonal_modifier(self, sensor: SensorConfig) -> float:
        """Calcula modificador estacional"""
        season = self.current_season

        if sensor.code in ["air_temperature", "water_temperature"]:
            if season == SeasonalPattern.SUMMER:
                return 1.15
            elif season == SeasonalPattern.WINTER:
                return 0.85
            elif season == SeasonalPattern.SPRING:
                return 0.95
            else:  # Autumn
                return 1.05

        elif sensor.code == "humidity":
            if season == SeasonalPattern.SUMMER:
                return 0.8
            elif season == SeasonalPattern.WINTER:
                return 1.2

        return 1.0

    def _calculate_sensor_correlations(self, sensor: SensorConfig, current_value: float) -> float:
        """Calcula correlaciones entre sensores para mayor realismo"""
        correlation_effect = 0.0

        # Temperatura del agua correlacionada con temperatura del aire
        if sensor.code == "water_temperature":
            air_temp_state = self.sensor_states.get("air_temperature")
            if air_temp_state:
                temp_diff = air_temp_state.last_value - current_value
                correlation_effect += temp_diff * 0.1  # Ajuste gradual

        # Caudal correlacionado con precipitación
        elif sensor.code == "flow_rate":
            precip_state = self.sensor_states.get("precipitation")
            if precip_state and precip_state.last_value > 1.0:  # Si está lloviendo
                correlation_effect += precip_state.last_value * 0.05

        # Turbidez correlacionada con caudal
        elif sensor.code == "turbidity":
            flow_state = self.sensor_states.get("flow_rate")
            if flow_state:
                flow_change = flow_state.last_value - sensor.base_value
                if flow_change > 0:
                    correlation_effect += flow_change * 0.02

        return correlation_effect

    def _apply_weather_events(self, sensor: SensorConfig, value: float, timestamp: datetime) -> float:
        """Aplica eventos climáticos especiales"""
        # Eventos aleatorios independientes del estado climático general
        if random.random() < 0.01:  # 1% probabilidad de evento especial
            if sensor.code == "turbidity":
                value *= random.uniform(2.0, 4.0)  # Pico de turbidez por contaminación
                logger.info(f"🗑️  Evento contaminación: turbidez x{random.uniform(2.0, 4.0):.1f}")
            elif sensor.code == "precipitation":
                value = random.uniform(5.0, 25.0)   # Lluvia intensa repentina
                logger.info(f"🌧️  Lluvia repentina: {value:.1f}mm")
            elif sensor.code == "flow_rate":
                value *= random.uniform(1.5, 3.0)   # Crecida repentina
                logger.info(f"🌊 Crecida repentina: caudal x{random.uniform(1.5, 3.0):.1f}")
            elif sensor.code in ["air_temperature", "water_temperature"]:
                if random.random() < 0.5:
                    value += random.uniform(5.0, 15.0)  # Ola de calor
                    logger.info(f"🔥 Ola de calor: +{random.uniform(5.0, 15.0):.1f}°C")
                else:
                    value -= random.uniform(5.0, 15.0)  # Frente frío
                    logger.info(f"❄️  Frente frío: -{random.uniform(5.0, 15.0):.1f}°C")

        return value

    def send_measurement(self, station_id: int, sensor_id: int, value: float, timestamp: datetime) -> bool:
        """Envía una medición al backend con metadatos realistas"""
        try:
            # Generar metadatos realistas del dispositivo
            device_id = f"SIM-{station_id:03d}-{sensor_id:03d}"
            signal_strength = random.randint(75, 100)
            battery_level = random.randint(80, 100)

            # Calidad de señal basada en "condiciones ambientales"
            if self.weather_state.event in [WeatherEvent.STORM, WeatherEvent.RAIN]:
                signal_strength = max(50, signal_strength - random.randint(10, 30))

            # Estado de batería degradándose con el tiempo
            battery_trend = (datetime.now(timezone.utc) - self.stats['start_time']).total_seconds() / 86400  # días
            battery_level = max(60, battery_level - int(battery_trend * 5))

            measurement_data = {
                'sensor_type': sensor_id,
                'station': station_id,
                'value': str(value),
                'timestamp': timestamp.isoformat(),
                'metadata': json.dumps({
                    'source': 'arduino_simulator',
                    'device_id': device_id,
                    'firmware_version': '2.1.4',
                    'signal_strength': signal_strength,
                    'battery_level': battery_level,
                    'temperature_sensor': round(random.uniform(20, 35), 1),
                    'calibration_status': 'valid' if random.random() > 0.05 else 'needs_calibration',
                    'weather_conditions': self.weather_state.event.value,
                    'season': self.current_season.value,
                    'data_quality': 'good' if signal_strength > 80 else 'fair' if signal_strength > 60 else 'poor'
                })
            }

            response = self.session.post(
                f"{self.backend_url}/api/measurements/module4/extensible-measurements/",
                headers=self.headers,
                json=measurement_data,
                timeout=10  # Timeout de 10 segundos
            )

            if response.status_code == 201:
                return True
            elif response.status_code == 429:  # Rate limiting
                logger.warning(f"⚠️  Rate limit alcanzado, esperando...")
                time.sleep(random.uniform(1, 3))
                return False
            elif response.status_code >= 500:  # Error del servidor
                logger.warning(f"⚠️  Error del servidor ({response.status_code}), reintentando...")
                time.sleep(random.uniform(0.5, 2))
                return False
            else:
                logger.warning(f"⚠️  Error enviando medición ({response.status_code}): {response.text[:200]}")
                return False

        except requests.exceptions.Timeout:
            logger.warning("⚠️  Timeout enviando medición, reintentando...")
            return False
        except requests.exceptions.ConnectionError:
            logger.error("❌ Error de conexión con el backend")
            return False
        except Exception as e:
            logger.error(f"❌ Error inesperado enviando medición: {e}")
            return False

    def simulate_station_cycle(self, station: StationConfig):
        """Simula un ciclo completo de medición para una estación"""
        if not station.station_id:
            logger.error(f"❌ Estación {station.name} no tiene ID asignado")
            return

        timestamp = datetime.now(timezone.utc)

        # Actualizar estado climático si está habilitado
        if self.weather_simulation:
            self._update_weather_state()

        measurements_sent = 0
        errors = 0

        logger.info(f"📊 Ciclo de medición - Estación: {station.name} | Clima: {self.weather_state.event.value}")

        for sensor in station.sensors:
            if not sensor.sensor_id:
                logger.warning(f"⚠️  Sensor {sensor.name} no tiene ID, omitiendo...")
                continue

            # Simular error ocasional del sensor
            if self.error_simulation and random.random() < 0.03:  # 3% error rate
                logger.warning(f"⚠️  Error simulado en sensor {sensor.name}")
                errors += 1
                self.stats['errors'] += 1
                continue

            # Generar valor realista
            value = self.generate_realistic_value(sensor, timestamp)

            # Enviar al backend
            if self.send_measurement(station.station_id, sensor.sensor_id, value, timestamp):
                measurements_sent += 1
                self.stats['measurements_sent'] += 1

                # Log detallado solo para valores extremos o eventos
                if abs(value - sensor.base_value) > (sensor.max_value - sensor.min_value) * 0.3:
                    logger.info(f"📈 {sensor.name}: {value} {sensor.unit} (EXTREMO)")
                elif random.random() < 0.1:  # 10% de logs normales
                    logger.debug(f"✅ {sensor.name}: {value} {sensor.unit}")
            else:
                logger.error(f"❌ Falló envío de {sensor.name}")
                errors += 1
                self.stats['errors'] += 1

        # Log de resumen del ciclo
        success_rate = (measurements_sent / len(station.sensors)) * 100 if station.sensors else 0
        logger.info(f"📈 Estación {station.name}: {measurements_sent}/{len(station.sensors)} mediciones "
                   f"({success_rate:.1f}% éxito) | Errores: {errors}")

        # Log de estadísticas cada 10 ciclos
        if self.stats['measurements_sent'] % (len(self.stations) * 10) == 0:
            self._log_simulation_stats()

    def _log_simulation_stats(self):
        """Log detallado de estadísticas de simulación"""
        runtime = datetime.now(timezone.utc) - self.stats['start_time']
        runtime_hours = runtime.total_seconds() / 3600

        total_measurements = self.stats['measurements_sent']
        total_errors = self.stats['errors']
        success_rate = (total_measurements / (total_measurements + total_errors)) * 100 if (total_measurements + total_errors) > 0 else 100

        logger.info("📊 === ESTADÍSTICAS DE SIMULACIÓN ===")
        logger.info(f"⏱️  Tiempo ejecutándose: {runtime_hours:.1f} horas")
        logger.info(f"📈 Mediciones enviadas: {total_measurements}")
        logger.info(f"❌ Errores totales: {total_errors}")
        logger.info(f"✅ Tasa de éxito: {success_rate:.1f}%")
        logger.info(f"🌤️  Eventos climáticos: {self.stats['events_triggered']}")
        logger.info(f"📊 Promedio por hora: {total_measurements / runtime_hours:.1f} mediciones")
        logger.info("=====================================")

    def start_simulation(self):
        """Inicia la simulación continua"""
        logger.info("🚀 === INICIANDO SIMULACIÓN ARDUINO/PLC ===")
        logger.info(f"📡 Backend URL: {self.backend_url}")
        logger.info(f"⏱️  Intervalo entre mediciones: {self.measurement_interval}s")
        logger.info(f"🏭 Número de estaciones: {len(self.stations)}")
        logger.info(f"📊 Sensores totales: {sum(len(s.sensors) for s in self.stations)}")
        logger.info(f"🌤️  Simulación climática: {'Habilitada' if self.weather_simulation else 'Deshabilitada'}")
        logger.info(f"❌ Simulación de errores: {'Habilitada' if self.error_simulation else 'Deshabilitada'}")
        logger.info(f"📅 Temporada actual: {self.current_season.value}")
        logger.info("==========================================")

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
        """Detiene la simulación y muestra estadísticas finales"""
        logger.info("🛑 === DETENIENDO SIMULACIÓN ===")
        self.running = False
        self.stop_event.set()

        # Mostrar estadísticas finales
        self._log_simulation_stats()

        logger.info("👋 Simulación detenida correctamente")

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
        logger.info(f"🧪 === ENVIANDO BURST DE PRUEBA ===")
        logger.info(f"🎯 Número de ciclos: {count}")
        logger.info(f"🏭 Estaciones por ciclo: {len(self.stations)}")
        logger.info(f"📊 Mediciones esperadas: ~{count * sum(len(s.sensors) for s in self.stations)}")
        logger.info("=================================")

        start_time = time.time()

        for i in range(count):
            cycle_start = time.time()

            logger.info(f"🔄 Ciclo {i+1}/{count}...")

            for station in self.stations:
                if station.station_id:
                    self.simulate_station_cycle(station)

            cycle_time = time.time() - cycle_start
            logger.info(f"✅ Ciclo {i+1} completado en {cycle_time:.2f}s")

            if i < count - 1:
                time.sleep(1)  # Pausa corta entre ráfagas

        total_time = time.time() - start_time
        total_measurements = self.stats['measurements_sent']
        rate = total_measurements / total_time if total_time > 0 else 0

        logger.info("🎉 === BURST COMPLETADO ===")
        logger.info(f"⏱️  Tiempo total: {total_time:.2f}s")
        logger.info(f"📈 Mediciones enviadas: {total_measurements}")
        logger.info(f"⚡ Velocidad: {rate:.1f} mediciones/segundo")
        logger.info("============================")


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
    parser.add_argument('--no-weather', action='store_true',
                        help='Deshabilitar simulación de eventos climáticos')
    parser.add_argument('--setup-only', action='store_true',
                        help='Solo configurar backend y salir')
    parser.add_argument('--verbose', action='store_true',
                        help='Habilitar logging detallado')

    args = parser.parse_args()

    # Registrar manejador de señales
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Configurar logging
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)

    # Crear simulador
    global simulator
    simulator = ArduinoSimulator(args.backend, args.token)
    simulator.measurement_interval = args.interval
    simulator.error_simulation = not args.no_errors
    simulator.weather_simulation = not args.no_weather

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
