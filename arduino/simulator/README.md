# 🤖 Simulador Arduino/PLC - Sistema RíoClaro

Simulador profesional que imita el comportamiento de Arduino/PLC enviando datos realistas de sensores al backend del sistema de monitoreo de agua RíoClaro.

## 🎯 Características

### 🏭 **Estaciones de Monitoreo**

- **Estación Río Norte**: 5 sensores (turbidez, pH, oxígeno, temperatura, caudal)
- **Estación Río Sur**: 5 sensores (turbidez, pH, conductividad, temperatura ambiente, humedad)
- **Estación Central**: 4 sensores (nitratos, precipitación, temperatura agua, caudal)

### 📊 **Sensores Simulados**

- Turbidez (0-1000 NTU)
- pH (0-14 pH)
- Oxígeno Disuelto (0-20 mg/L)
- Temperatura del Agua (-5-50°C)
- Caudal (0-1000 m³/s)
- Temperatura Ambiente (-20-60°C)
- Humedad Relativa (0-100%)
- Precipitación (0-500mm)
- Conductividad (0-10000 µS/cm)
- Nitratos (0-100 mg/L)

### 🎛️ **Funcionalidades Avanzadas**

- ✅ Datos realistas con patrones temporales
- ✅ Ruido y variabilidad natural
- ✅ Eventos especiales aleatorios
- ✅ Simulación de errores de sensores
- ✅ Reconexión automática
- ✅ Logs detallados
- ✅ Configuración via argumentos

## 🚀 Instalación y Configuración

### 1. Configuración Rápida

```bash
cd arduino/simulator
chmod +x setup.sh
./setup.sh
```

### 2. Instalación Manual

```bash
# Instalar dependencias
pip3 install -r requirements.txt

# Hacer ejecutables
chmod +x mock_arduino.py
chmod +x simulator_utils.py
```

## 🎮 Uso del Simulador

### Comandos Básicos

```bash
# Ayuda completa
./mock_arduino.py --help

# Simulación continua básica
./mock_arduino.py

# Con backend personalizado
./mock_arduino.py --backend http://localhost:8000

# Con intervalo personalizado (15 segundos)
./mock_arduino.py --interval 15

# Solo configurar backend (no simular)
./mock_arduino.py --setup-only

# Ráfaga de prueba (enviar 10 ciclos rápidos)
./mock_arduino.py --test-burst 10

# Sin simulación de errores
./mock_arduino.py --no-errors
```

### Comandos Avanzados

```bash
# Con autenticación
./mock_arduino.py --token YOUR_AUTH_TOKEN --backend http://production-server.com

# Configuración completa
./mock_arduino.py \
  --backend http://localhost:8000 \
  --interval 30 \
  --token abc123 \
  --no-errors
```

## 🛠️ Utilidades Adicionales

### Probar Endpoints

```bash
./simulator_utils.py test-endpoints --backend http://localhost:8000
```

### Crear Estación de Prueba

```bash
./simulator_utils.py create-station --backend http://localhost:8000
```

### Enviar Mediciones de Prueba

```bash
./simulator_utils.py test-measurements \
  --backend http://localhost:8000 \
  --station-id 1 \
  --sensor-id 1 \
  --count 10
```

### Monitorear en Tiempo Real

```bash
./simulator_utils.py monitor --backend http://localhost:8000 --duration 120
```

### Limpiar Datos de Prueba

```bash
./simulator_utils.py cleanup --backend http://localhost:8000
```

## 📋 Flujo de Trabajo Típico

### 1. Primera Vez

```bash
# Configurar
./setup.sh

# Probar conexión
./simulator_utils.py test-endpoints

# Configurar backend
./mock_arduino.py --setup-only

# Ráfaga de prueba
./mock_arduino.py --test-burst 5
```

### 2. Simulación Continua

```bash
# Iniciar simulación
./mock_arduino.py --backend http://localhost:8000 --interval 30

# En otra terminal - monitorear
./simulator_utils.py monitor --duration 300
```

### 3. Testing y Desarrollo

```bash
# Pruebas rápidas
./mock_arduino.py --test-burst 3 --no-errors

# Limpiar después de pruebas
./simulator_utils.py cleanup
```

## 🔧 Configuración Avanzada

### Variables de Entorno

```bash
export RIOCLARO_BACKEND="http://localhost:8000"
export RIOCLARO_TOKEN="your_token_here"
export RIOCLARO_INTERVAL=30
```

### Logs

Los logs se guardan automáticamente en:

- `arduino_simulator.log` - Log principal del simulador
- Terminal - Output en tiempo real con colores

### Personalización de Sensores

Para modificar los sensores, edita la función `_initialize_stations()` en `mock_arduino.py`:

```python
SensorConfig(
    name="Nuevo Sensor",
    code="nuevo_sensor",
    unit="unidad",
    min_value=0,
    max_value=100,
    base_value=50,
    noise_factor=0.1
)
```

## 📊 Datos Generados

### Formato de Medición

```json
{
  "sensor_type": 1,
  "station": 1,
  "value": "25.3456",
  "timestamp": "2025-09-27T15:30:00Z",
  "metadata": {
    "source": "arduino_simulator",
    "device_id": "SIM-001",
    "signal_strength": 95,
    "battery_level": 87
  }
}
```

### Patrones Realistas

- **Temperatura**: Patrón diario (más calor al mediodía)
- **Turbidez**: Picos aleatorios (lluvia/eventos)
- **pH**: Pequeñas variaciones graduales
- **Caudal**: Cambios estacionales simulados
- **Precipitación**: Eventos de lluvia esporádicos

## 🚨 Gestión de Errores

### Errores Simulados (5% probabilidad)

- Sensores temporalmente no disponibles
- Valores fuera de rango ocasionales
- Problemas de conectividad simulados

### Recuperación Automática

- Reconexión automática al backend
- Reintentos con backoff exponencial
- Logs detallados de problemas

## 📈 Monitoreo y Debugging

### Logs Importantes

```bash
# Seguir logs en tiempo real
tail -f arduino_simulator.log

# Filtrar errores
grep "ERROR" arduino_simulator.log

# Estadísticas de envío
grep "Enviadas" arduino_simulator.log
```

### Indicadores de Estado

- ✅ = Operación exitosa
- ⚠️ = Advertencia/problema menor
- ❌ = Error crítico
- 📊 = Información de medición
- 🔧 = Configuración/setup

## 🤝 Integración con Backend

### Endpoints Utilizados

- `POST /api/measurements/module4/extensible-measurements/` - Envío de mediciones
- `GET /api/stations/` - Verificación de estaciones
- `GET /api/measurements/module4/dynamic-sensors/` - Verificación de sensores
- `POST /api/stations/` - Creación de estaciones (si no existen)

### Autenticación

```bash
# Con token de usuario
./mock_arduino.py --token YOUR_TOKEN

# Headers enviados
{
  "Authorization": "Token YOUR_TOKEN",
  "Content-Type": "application/json",
  "User-Agent": "Arduino-Simulator/1.0"
}
```

## 🎯 Casos de Uso

### Desarrollo

- Testing de APIs
- Validación de backend
- Pruebas de carga básicas
- Debug de integración

### Demostración

- Datos en tiempo real para demos
- Simulación de escenarios realistas
- Presentaciones a clientes
- Prototipado rápido

### Testing

- Pruebas de rendimiento
- Validación de alertas
- Testing de reportes
- Pruebas de conectividad

## 📞 Troubleshooting

### Problemas Comunes

**Error de conexión**

```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:8000/api/measurements/module4/sensor-categories/

# Probar con utilidades
./simulator_utils.py test-endpoints
```

**Sensores no encontrados**

```bash
# Inicializar sistema modular primero
cd ../backend
python manage.py init_modular_system
```

**Permisos denegados**

```bash
# Obtener token de autenticación
./simulator_utils.py --help  # Ver ejemplos de autenticación
```

### Debug Avanzado

```bash
# Aumentar verbosidad de logs
export PYTHONPATH="."
python3 -u mock_arduino.py --test-burst 1 2>&1 | tee debug.log
```

## 🆕 Actualizaciones Futuras

- [ ] Interfaz web para control remoto
- [ ] Protocolos industriales (Modbus, OPC-UA)
- [ ] Simulación de fallos complejos
- [ ] Múltiples perfiles de simulación
- [ ] Dashboard de monitoreo del simulador
- [ ] Exportación de datos históricos
- [ ] Integración con Grafana/InfluxDB

---

**¡El simulador está listo para generar datos realistas para tu sistema RíoClaro! 🌊**
