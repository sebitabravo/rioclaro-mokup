# 📡 ARDUINO HARDWARE - INTEGRACIÓN COMPLETA

## 🎯 Sistema de Monitoreo con Arduino Real

Este documento explica cómo integrar dispositivos Arduino reales con el sistema RíoClaro para monitoreo ambiental de ríos.

---

## 🔧 HARDWARE REQUERIDO

### Componentes Básicos
- **ESP32 o ESP8266** - Microcontrolador con WiFi
- **Sensores de calidad de agua:**
  - Turbidez (analógico)
  - pH (analógico)
  - Oxígeno disuelto (analógico)
  - Temperatura DS18B20 (digital)
- **Sensor ultrasónico** - Nivel de agua (HC-SR04)
- **Sensores opcionales:**
  - DHT11/DHT22 - Humedad y temperatura ambiente
  - Sensor de lluvia - Precipitación
  - TDS/EC - Conductividad

### Conexiones ESP32

```cpp
// Pines recomendados
#define TURBIDITY_PIN 34    // ADC1_6
#define PH_PIN 35          // ADC1_7
#define DO_PIN 32          // ADC1_4
#define TEMP_PIN 4         // GPIO4 (OneWire)
#define ULTRASONIC_TRIGGER 12  // GPIO12
#define ULTRASONIC_ECHO 13     // GPIO13
```

---

## 📝 CONFIGURACIÓN DEL ARDUINO

### 1. Instalar Arduino IDE
```bash
# Descargar desde: https://www.arduino.cc/en/software
```

### 2. Instalar ESP32 Board
1. Abrir Arduino IDE
2. Ir a `File > Preferences`
3. Agregar URL: `https://dl.espressif.com/dl/package_esp32_index.json`
4. Ir a `Tools > Board > Boards Manager`
5. Buscar "ESP32" e instalar

### 3. Instalar Librerías
En Arduino IDE:
- `Sketch > Include Library > Manage Libraries`
- Instalar:
  - `ArduinoJson` (por Benoit Blanchon)
  - `OneWire` (por Paul Stoffregen)
  - `DallasTemperature` (por Miles Burton)

### 4. Configurar WiFi y Backend

Editar las constantes en `river_sensor.ino`:

```cpp
// ========== CONFIGURACIÓN WIFI ==========
const char* WIFI_SSID = "TU_WIFI_SSID";
const char* WIFI_PASSWORD = "TU_WIFI_PASSWORD";

// ========== CONFIGURACIÓN BACKEND ==========
const char* BACKEND_URL = "http://192.168.1.100:8000";  // IP de tu servidor
const char* AUTH_TOKEN = "1cfcc2538f74c3b1f39e1b7d88fc3c5319a0e415";  // Token del admin

// ========== CONFIGURACIÓN DEL DISPOSITIVO ==========
const char* DEVICE_ID = "ARDUINO_SENSOR_001";
const char* STATION_CODE = "RN-001";  // Código de la estación
```

### 5. Subir el Código
1. Conectar ESP32 por USB
2. Seleccionar board: `Tools > Board > ESP32 Dev Module`
3. Seleccionar puerto: `Tools > Port`
4. Subir: `Sketch > Upload` (Ctrl+U)

---

## 🔌 CONEXIÓN DE SENSORES

### Sensor de Turbidez
```
ESP32 (34) ←───── Turbidez (señal analógica)
Turbidez (VCC) ──→ 3.3V
Turbidez (GND) ──→ GND
```

### Sensor de pH
```
ESP32 (35) ←───── pH (señal analógica)
pH (VCC) ────────→ 3.3V
pH (GND) ────────→ GND
```

### Sensor de Oxígeno Disuelto
```
ESP32 (32) ←───── DO (señal analógica)
DO (VCC) ────────→ 3.3V
DO (GND) ────────→ GND
```

### Sensor de Temperatura DS18B20
```
ESP32 (4) ←────── DS18B20 (señal)
DS18B20 (VCC) ──→ 3.3V
DS18B20 (GND) ──→ GND
Resistencia 4.7kΩ entre VCC y señal
```

### Sensor Ultrasónico HC-SR04
```
ESP32 (12) ────── Trigger
ESP32 (13) ←───── Echo
HC-SR04 (VCC) ──→ 5V (o 3.3V)
HC-SR04 (GND) ──→ GND
```

---

## ⚙️ CALIBRACIÓN DE SENSORES

### Calibración de Turbidez
```cpp
// Función de calibración básica
float readTurbidity() {
    int rawValue = analogRead(TURBIDITY_PIN);
    // Ajustar según tu sensor específico
    float voltage = rawValue * (3.3 / 4095.0);
    float turbidity = map(rawValue, 0, 4095, 1000, 0);
    return constrain(turbidity, 0, 1000);
}
```

### Calibración de pH
```cpp
float readPH() {
    int rawValue = analogRead(PH_PIN);
    // Ajustar según tu sensor específico
    float voltage = rawValue * (3.3 / 4095.0);
    // pH = (voltaje - offset) * factor
    float ph = map(rawValue, 0, 4095, 0, 140) / 10.0;
    return constrain(ph, 0, 14);
}
```

### Calibración de Oxígeno Disuelto
```cpp
float readDissolvedOxygen() {
    int rawValue = analogRead(DO_PIN);
    // Ajustar según tu sensor específico
    float voltage = rawValue * (3.3 / 4095.0);
    float doValue = map(rawValue, 0, 4095, 0, 200) / 10.0;
    return constrain(doValue, 0, 20);
}
```

---

## 🌐 CONECTIVIDAD Y COMUNICACIÓN

### Protocolo de Comunicación

El Arduino envía datos en formato JSON:

```json
{
  "device_id": "ARDUINO_SENSOR_001",
  "station_code": "RN-001",
  "timestamp": "123456789",
  "device_info": {
    "battery_level": 85.5,
    "signal_strength": -45,
    "firmware_version": "1.0.0",
    "uptime": 3600
  },
  "sensors": {
    "turbidity": {
      "value": 15.2,
      "unit": "NTU",
      "sensor_type": "TURBIDITY"
    },
    "ph": {
      "value": 7.1,
      "unit": "pH",
      "sensor_type": "PH"
    }
  }
}
```

### Endpoint del Backend

Los datos se envían a:
```
POST /api/measurements/module4/extensible-measurements/
Authorization: Token {AUTH_TOKEN}
Content-Type: application/json
```

### Manejo de Errores

El Arduino incluye:
- ✅ Reconexión automática WiFi
- ✅ Reintentos de envío HTTP
- ✅ Timeout handling
- ✅ Logging detallado por Serial
- ✅ Estado persistente en EEPROM

---

## 🔋 ALIMENTACIÓN Y AHORRO DE ENERGÍA

### Modo Deep Sleep (Opcional)

Para ahorro de energía en despliegues remotos:

```cpp
// Agregar al final del loop()
if (batteryLevel < 20.0) {
    Serial.println("🔋 Batería baja, entrando en deep sleep...");
    esp_deep_sleep_start();
}

// Configurar wake up timer (30 minutos)
esp_sleep_enable_timer_wakeup(30 * 60 * 1000000ULL);
```

### Alimentación Recomendada
- **Desarrollo:** USB 5V
- **Producción:** Panel solar + batería LiPo 3.7V
- **Remoto:** Baterías AA con regulador de voltaje

---

## 📊 MONITOREO Y DEBUGGING

### Logs por Serial

El Arduino imprime información detallada:

```
🚀 Iniciando RíoClaro Sensor...
📱 Device ID: ARDUINO_SENSOR_001
🏭 Station: RN-001
🔗 Backend: http://192.168.1.100:8000
📊 Envíos anteriores: 0
🔋 Batería: 100.0%

🔌 Conectando a WiFi...
✅ WiFi conectado!
📡 IP: 192.168.1.150
📶 Señal: -45 dBm

📊 CICLO DE MEDICIÓN #1
🔍 Leyendo sensores...
  Turbidez: 15.2 NTU
  pH: 7.1
  Oxígeno Disuelto: 8.5 mg/L
  Temperatura Agua: 18.3 °C
  Nivel Agua: 1.2 m
  Temperatura Aire: 22.1 °C
  Humedad: 65.4 %
  Precipitación: 0.0 mm
  Conductividad: 245.6 µS/cm
  Batería: 99.5 %

📄 JSON generado: {...}
📤 Enviando datos al backend...
✅ Respuesta HTTP: 201
✅ Datos enviados exitosamente!
```

### Verificación en Backend

```bash
# Ver mediciones del Arduino
curl -H "Authorization: Token 1cfcc2538f74c3b1f39e1b7d88fc3c5319a0e415" \
     http://localhost:8000/api/measurements/module4/extensible-measurements/ | jq
```

---

## 🛠️ DEPLOYMENT Y MANTENIMIENTO

### Configuración de Red

Para producción, cambiar:
```cpp
const char* BACKEND_URL = "https://tu-dominio.com";
```

### Actualizaciones OTA

El código incluye soporte para OTA (Over-The-Air):

```cpp
// Agregar librería
#include <ArduinoOTA.h>

// En setup()
ArduinoOTA.begin();

// En loop()
ArduinoOTA.handle();
```

### Múltiples Dispositivos

Para múltiples Arduinos:
1. Cambiar `DEVICE_ID` en cada uno
2. Asignar diferentes `STATION_CODE`
3. Usar el mismo `AUTH_TOKEN`

### Backup y Recovery

El Arduino guarda estado en EEPROM:
- Conteo de envíos
- Nivel de batería
- Última configuración

---

## 🚨 TROUBLESHOOTING

### Problema: No se conecta a WiFi
```
❌ Error conectando a WiFi
```
**Solución:**
- Verificar credenciales WiFi
- Cambiar canal WiFi (2.4GHz)
- Verificar alcance de señal

### Problema: Error HTTP 403
```
❌ Error HTTP: 403
```
**Solución:**
- Verificar `AUTH_TOKEN`
- Asegurar que el usuario admin existe
- Verificar permisos en backend

### Problema: Sensores no responden
```
❌ Error leyendo temperatura del agua
```
**Solución:**
- Verificar conexiones físicas
- Calibrar sensores
- Verificar alimentación de sensores

### Problema: Datos no llegan al backend
```
❌ Error enviando datos después de todos los reintentos
```
**Solución:**
- Verificar conectividad de red
- Verificar URL del backend
- Verificar que backend esté corriendo

---

## 📈 ESCALABILIDAD

### Múltiples Estaciones

Para múltiples estaciones de monitoreo:

1. **Configurar múltiples Arduinos:**
   ```cpp
   // Arduino 1
   const char* DEVICE_ID = "ARDUINO_SENSOR_001";
   const char* STATION_CODE = "RN-001";

   // Arduino 2
   const char* DEVICE_ID = "ARDUINO_SENSOR_002";
   const char* STATION_CODE = "RS-002";
   ```

2. **Backend maneja automáticamente:**
   - ✅ Asociación con estaciones existentes
   - ✅ Creación de nuevos sensores dinámicos
   - ✅ Almacenamiento de metadata

### Red Mesh (Avanzado)

Para áreas grandes sin WiFi:
- Usar ESP32 con ESP-NOW
- Un Arduino central con internet
- Comunicación mesh entre dispositivos

---

## 🔒 SEGURIDAD

### Consideraciones de Seguridad

1. **Token de Autenticación:**
   - Usar tokens específicos por dispositivo
   - Rotar tokens periódicamente
   - No hardcodear en código público

2. **Comunicación:**
   - Usar HTTPS en producción
   - Implementar encriptación si es crítico
   - Validar certificados SSL

3. **Acceso Físico:**
   - Proteger dispositivos contra vandalismo
   - Usar cajas selladas
   - Implementar tamper detection

---

## 📚 REFERENCIAS Y RECURSOS

### Documentación de Sensores
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [ArduinoJson Library](https://arduinojson.org/)
- [OneWire Library](https://www.pjrc.com/teensy/td_libs_OneWire.html)

### Librerías Recomendadas
- `WiFiManager` - Configuración WiFi automática
- `ESPAsyncWebServer` - Servidor web asíncrono
- `PubSubClient` - MQTT para comunicación

### Comunidad
- [ESP32 Forum](https://esp32.com/)
- [Arduino Forum](https://forum.arduino.cc/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/esp32)

---

## 🎯 PRÓXIMOS PASOS

### Mejoras Inmediatas
1. **Calibración precisa** de sensores
2. **OTA updates** para actualizaciones remotas
3. **Deep sleep** para ahorro de energía
4. **Mesh networking** para áreas grandes

### Features Avanzadas
1. **GPS integration** para ubicación automática
2. **SD card logging** como backup
3. **LoRa communication** para áreas remotas
4. **Solar power management**

---

**¡Tu Arduino ahora está completamente integrado con RíoClaro!** 🎉

El sistema puede alternar entre:
- **Simulador Python** (desarrollo/testing)
- **Arduino Real** (producción/monitoreo real)

Ambos envían datos al mismo backend y se visualizan en el mismo frontend.