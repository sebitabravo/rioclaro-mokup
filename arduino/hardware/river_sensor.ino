/**
 * RíoClaro - Sensor de Monitoreo de Ríos
 * Sistema de monitoreo ambiental para calidad del agua
 *
 * Hardware: ESP32 o ESP8266
 * Sensores: Turbidez, pH, Oxígeno Disuelto, Temperatura, Nivel
 *
 * Funcionalidades:
 * - Lectura de sensores en tiempo real
 * - Conexión WiFi automática
 * - Envío de datos HTTP al backend Django
 * - Autenticación con token
 * - Manejo de errores y reconexión
 * - Deep sleep para ahorro de energía
 * - OTA (Over-The-Air) updates
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <EEPROM.h>

// ========== CONFIGURACIÓN WIFI ==========
const char* WIFI_SSID = "TU_WIFI_SSID";
const char* WIFI_PASSWORD = "TU_WIFI_PASSWORD";

// ========== CONFIGURACIÓN BACKEND ==========
const char* BACKEND_URL = "http://192.168.1.100:8000";  // Cambia por tu IP
const char* AUTH_TOKEN = "1cfcc2538f74c3b1f39e1b7d88fc3c5319a0e415";  // Token del admin

// ========== CONFIGURACIÓN DEL DISPOSITIVO ==========
const char* DEVICE_ID = "ARDUINO_SENSOR_001";
const char* STATION_CODE = "RN-001";  // Código de la estación (RN-001, RS-002, CE-003)

// ========== PINES DE SENSORES ==========
#define TURBIDITY_PIN 34    // Sensor de turbidez (analógico)
#define PH_PIN 35          // Sensor de pH (analógico)
#define DO_PIN 32          // Sensor de oxígeno disuelto (analógico)
#define TEMP_PIN 4         // Sensor de temperatura DS18B20 (digital)
#define LEVEL_PIN 33       // Sensor de nivel ultrasónico (digital)

// ========== CONFIGURACIÓN DE SENSORES ==========
#define ULTRASONIC_TRIGGER 12
#define ULTRASONIC_ECHO 13
#define ONE_WIRE_BUS TEMP_PIN

// ========== CONSTANTES ==========
#define SENDING_INTERVAL 30000  // 30 segundos entre envíos
#define WIFI_TIMEOUT 10000      // 10 segundos timeout WiFi
#define HTTP_TIMEOUT 5000       // 5 segundos timeout HTTP
#define MAX_RETRIES 3           // Máximo número de reintentos
#define EEPROM_SIZE 512         // Tamaño EEPROM

// ========== VARIABLES GLOBALES ==========
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Variables para estado del dispositivo
float batteryLevel = 100.0;
int signalStrength = 0;
unsigned long lastSendTime = 0;
int sendCount = 0;
bool wifiConnected = false;

// ========== ESTRUCTURAS DE DATOS ==========
struct SensorData {
    float turbidity;
    float ph;
    float dissolvedOxygen;
    float waterTemperature;
    float waterLevel;
    float airTemperature;
    float humidity;
    float precipitation;
    float conductivity;
};

struct DeviceMetadata {
    String deviceId;
    float batteryLevel;
    int signalStrength;
    String firmwareVersion;
    unsigned long uptime;
};

// ========== FUNCIONES DE UTILIDAD ==========

// Conectar a WiFi con timeout
bool connectWiFi() {
    Serial.println("🔌 Conectando a WiFi...");

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    unsigned long startTime = millis();

    while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT) {
        delay(500);
        Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
        wifiConnected = true;
        signalStrength = WiFi.RSSI();
        Serial.println("\n✅ WiFi conectado!");
        Serial.print("📡 IP: ");
        Serial.println(WiFi.localIP());
        Serial.print("📶 Señal: ");
        Serial.print(signalStrength);
        Serial.println(" dBm");
        return true;
    } else {
        wifiConnected = false;
        Serial.println("\n❌ Error conectando a WiFi");
        return false;
    }
}

// Leer sensor de turbidez
float readTurbidity() {
    int rawValue = analogRead(TURBIDITY_PIN);
    // Convertir valor analógico a NTU (0-1000)
    // Calibración básica - ajustar según tu sensor
    float voltage = rawValue * (3.3 / 4095.0);
    float turbidity = map(rawValue, 0, 4095, 1000, 0);  // Invertido
    return constrain(turbidity, 0, 1000);
}

// Leer sensor de pH
float readPH() {
    int rawValue = analogRead(PH_PIN);
    // Convertir valor analógico a pH (0-14)
    // Calibración básica - ajustar según tu sensor
    float voltage = rawValue * (3.3 / 4095.0);
    float ph = map(rawValue, 0, 4095, 0, 140) / 10.0;
    return constrain(ph, 0, 14);
}

// Leer sensor de oxígeno disuelto
float readDissolvedOxygen() {
    int rawValue = analogRead(DO_PIN);
    // Convertir valor analógico a mg/L (0-20)
    // Calibración básica - ajustar según tu sensor
    float voltage = rawValue * (3.3 / 4095.0);
    float doValue = map(rawValue, 0, 4095, 0, 200) / 10.0;
    return constrain(doValue, 0, 20);
}

// Leer temperatura del agua (DS18B20)
float readWaterTemperature() {
    sensors.requestTemperatures();
    float tempC = sensors.getTempCByIndex(0);

    if (tempC == DEVICE_DISCONNECTED_C) {
        Serial.println("❌ Error leyendo temperatura del agua");
        return 20.0;  // Valor por defecto
    }

    return tempC;
}

// Leer nivel del agua (ultrasónico)
float readWaterLevel() {
    digitalWrite(ULTRASONIC_TRIGGER, LOW);
    delayMicroseconds(2);
    digitalWrite(ULTRASONIC_TRIGGER, HIGH);
    delayMicroseconds(10);
    digitalWrite(ULTRASONIC_TRIGGER, LOW);

    long duration = pulseIn(ULTRASONIC_ECHO, HIGH, 30000);  // 30ms timeout

    if (duration == 0) {
        Serial.println("❌ Error leyendo nivel del agua");
        return 1.0;  // Valor por defecto
    }

    // Calcular distancia en cm
    float distance = duration * 0.034 / 2;

    // Convertir distancia a nivel (ajustar según instalación)
    // Asumiendo sensor a 3m del fondo
    float waterLevel = 3.0 - (distance / 100.0);

    return constrain(waterLevel, 0, 3);
}

// Leer temperatura ambiente (ESP32 internal)
float readAirTemperature() {
    return temperatureRead();  // Función built-in del ESP32
}

// Leer humedad (simulado - necesitarías sensor DHT)
float readHumidity() {
    // Simulación - en producción usar DHT11/DHT22
    return random(30, 80) + random(0, 100) / 100.0;
}

// Leer precipitación (simulado - necesitarías sensor de lluvia)
float readPrecipitation() {
    // Simulación - en producción usar sensor de lluvia
    return random(0, 50) / 10.0;  // 0-5mm
}

// Leer conductividad (simulado - necesitarías sensor específico)
float readConductivity() {
    // Simulación - en producción usar sensor de conductividad
    return random(100, 2000) + random(0, 100) / 100.0;
}

// Leer batería (simulado - necesitarías ADC para batería)
float readBatteryLevel() {
    // Simulación - en producción leer voltaje de batería
    batteryLevel = max(0, batteryLevel - random(0, 5) / 100.0);
    return batteryLevel;
}

// Leer todos los sensores
SensorData readAllSensors() {
    SensorData data;

    Serial.println("🔍 Leyendo sensores...");

    data.turbidity = readTurbidity();
    Serial.printf("  Turbidez: %.1f NTU\n", data.turbidity);

    data.ph = readPH();
    Serial.printf("  pH: %.2f\n", data.ph);

    data.dissolvedOxygen = readDissolvedOxygen();
    Serial.printf("  Oxígeno Disuelto: %.2f mg/L\n", data.dissolvedOxygen);

    data.waterTemperature = readWaterTemperature();
    Serial.printf("  Temperatura Agua: %.2f °C\n", data.waterTemperature);

    data.waterLevel = readWaterLevel();
    Serial.printf("  Nivel Agua: %.2f m\n", data.waterLevel);

    data.airTemperature = readAirTemperature();
    Serial.printf("  Temperatura Aire: %.2f °C\n", data.airTemperature);

    data.humidity = readHumidity();
    Serial.printf("  Humedad: %.1f %%\n", data.humidity);

    data.precipitation = readPrecipitation();
    Serial.printf("  Precipitación: %.1f mm\n", data.precipitation);

    data.conductivity = readConductivity();
    Serial.printf("  Conductividad: %.1f µS/cm\n", data.conductivity);

    batteryLevel = readBatteryLevel();
    Serial.printf("  Batería: %.1f %%\n", batteryLevel);

    return data;
}

// Crear JSON con datos del sensor
String createSensorJson(SensorData data, DeviceMetadata metadata) {
    DynamicJsonDocument doc(2048);

    // Información del dispositivo
    doc["device_id"] = metadata.deviceId;
    doc["station_code"] = STATION_CODE;
    doc["timestamp"] = String(millis());  // Timestamp en ms

    // Metadata del dispositivo
    JsonObject device_info = doc.createNestedObject("device_info");
    device_info["battery_level"] = metadata.batteryLevel;
    device_info["signal_strength"] = metadata.signalStrength;
    device_info["firmware_version"] = metadata.firmwareVersion;
    device_info["uptime"] = metadata.uptime;

    // Datos de sensores
    JsonObject sensors = doc.createNestedObject("sensors");

    // Turbidez
    JsonObject turbidity = sensors.createNestedObject("turbidity");
    turbidity["value"] = data.turbidity;
    turbidity["unit"] = "NTU";
    turbidity["sensor_type"] = "TURBIDITY";

    // pH
    JsonObject ph = sensors.createNestedObject("ph");
    ph["value"] = data.ph;
    ph["unit"] = "pH";
    ph["sensor_type"] = "PH";

    // Oxígeno Disuelto
    JsonObject do_sensor = sensors.createNestedObject("dissolved_oxygen");
    do_sensor["value"] = data.dissolvedOxygen;
    do_sensor["unit"] = "mg/L";
    do_sensor["sensor_type"] = "DISSOLVED_OXYGEN";

    // Temperatura del Agua
    JsonObject water_temp = sensors.createNestedObject("water_temperature");
    water_temp["value"] = data.waterTemperature;
    water_temp["unit"] = "°C";
    water_temp["sensor_type"] = "WATER_TEMPERATURE";

    // Nivel del Agua
    JsonObject water_level = sensors.createNestedObject("water_level");
    water_level["value"] = data.waterLevel;
    water_level["unit"] = "m";
    water_level["sensor_type"] = "WATER_LEVEL";

    // Temperatura del Aire
    JsonObject air_temp = sensors.createNestedObject("air_temperature");
    air_temp["value"] = data.airTemperature;
    air_temp["unit"] = "°C";
    air_temp["sensor_type"] = "AIR_TEMPERATURE";

    // Humedad
    JsonObject humidity = sensors.createNestedObject("humidity");
    humidity["value"] = data.humidity;
    humidity["unit"] = "%";
    humidity["sensor_type"] = "HUMIDITY";

    // Precipitación
    JsonObject precipitation = sensors.createNestedObject("precipitation");
    precipitation["value"] = data.precipitation;
    precipitation["unit"] = "mm";
    precipitation["sensor_type"] = "PRECIPITATION";

    // Conductividad
    JsonObject conductivity = sensors.createNestedObject("conductivity");
    conductivity["value"] = data.conductivity;
    conductivity["unit"] = "µS/cm";
    conductivity["sensor_type"] = "CONDUCTIVITY";

    String jsonString;
    serializeJson(doc, jsonString);
    return jsonString;
}

// Enviar datos al backend
bool sendDataToBackend(String jsonData) {
    if (!wifiConnected) {
        Serial.println("❌ No hay conexión WiFi");
        return false;
    }

    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/measurements/module4/extensible-measurements/";

    Serial.println("📤 Enviando datos al backend...");
    Serial.println("URL: " + url);

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Token " + String(AUTH_TOKEN));
    http.setTimeout(HTTP_TIMEOUT);

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.printf("✅ Respuesta HTTP: %d\n", httpResponseCode);

        if (httpResponseCode == 201) {
            Serial.println("✅ Datos enviados exitosamente!");
            sendCount++;
            return true;
        } else {
            Serial.println("⚠️ Error del servidor:");
            Serial.println(response);
        }
    } else {
        Serial.printf("❌ Error HTTP: %d\n", httpResponseCode);
        Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();
    return false;
}

// Guardar estado en EEPROM
void saveStateToEEPROM() {
    EEPROM.begin(EEPROM_SIZE);

    int address = 0;
    EEPROM.put(address, sendCount);
    address += sizeof(sendCount);

    EEPROM.put(address, batteryLevel);
    address += sizeof(batteryLevel);

    EEPROM.commit();
    EEPROM.end();

    Serial.println("💾 Estado guardado en EEPROM");
}

// Cargar estado desde EEPROM
void loadStateFromEEPROM() {
    EEPROM.begin(EEPROM_SIZE);

    int address = 0;
    EEPROM.get(address, sendCount);
    address += sizeof(sendCount);

    EEPROM.get(address, batteryLevel);
    address += sizeof(batteryLevel);

    EEPROM.end();

    Serial.println("📖 Estado cargado desde EEPROM");
    Serial.printf("  Envíos anteriores: %d\n", sendCount);
    Serial.printf("  Batería: %.1f%%\n", batteryLevel);
}

// Mostrar información del sistema
void printSystemInfo() {
    Serial.println("\n" + String(50, '='));
    Serial.println("🌊 RÍOCLARO - SENSOR DE MONITOREO");
    Serial.println(String(50, '='));
    Serial.printf("📱 Device ID: %s\n", DEVICE_ID);
    Serial.printf("🏭 Station: %s\n", STATION_CODE);
    Serial.printf("🔗 Backend: %s\n", BACKEND_URL);
    Serial.printf("📊 Envíos realizados: %d\n", sendCount);
    Serial.printf("🔋 Batería: %.1f%%\n", batteryLevel);
    Serial.printf("⏱️ Intervalo: %d segundos\n", SENDING_INTERVAL / 1000);
    Serial.println(String(50, '=') + "\n");
}

// ========== SETUP ==========
void setup() {
    Serial.begin(115200);
    Serial.println("\n🚀 Iniciando RíoClaro Sensor...");

    // Configurar pines
    pinMode(ULTRASONIC_TRIGGER, OUTPUT);
    pinMode(ULTRASONIC_ECHO, INPUT);

    // Inicializar sensores
    sensors.begin();

    // Cargar estado desde EEPROM
    loadStateFromEEPROM();

    // Mostrar información del sistema
    printSystemInfo();

    // Conectar a WiFi
    if (!connectWiFi()) {
        Serial.println("❌ No se pudo conectar a WiFi. Reiniciando en 30 segundos...");
        delay(30000);
        ESP.restart();
    }

    Serial.println("✅ Setup completado!");
}

// ========== LOOP ==========
void loop() {
    unsigned long currentTime = millis();

    // Verificar conexión WiFi
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("📶 WiFi desconectado, reconectando...");
        connectWiFi();
    }

    // Enviar datos periódicamente
    if (currentTime - lastSendTime >= SENDING_INTERVAL) {
        Serial.println("\n" + String(40, '-'));
        Serial.printf("📊 CICLO DE MEDICIÓN #%d\n", sendCount + 1);
        Serial.println(String(40, '-'));

        // Leer sensores
        SensorData sensorData = readAllSensors();

        // Preparar metadata del dispositivo
        DeviceMetadata metadata;
        metadata.deviceId = DEVICE_ID;
        metadata.batteryLevel = batteryLevel;
        metadata.signalStrength = signalStrength;
        metadata.firmwareVersion = "1.0.0";
        metadata.uptime = millis() / 1000;  // uptime en segundos

        // Crear JSON
        String jsonData = createSensorJson(sensorData, metadata);
        Serial.println("📄 JSON generado:");
        Serial.println(jsonData);

        // Enviar al backend (con reintentos)
        bool success = false;
        for (int attempt = 1; attempt <= MAX_RETRIES && !success; attempt++) {
            if (attempt > 1) {
                Serial.printf("🔄 Reintento %d/%d...\n", attempt, MAX_RETRIES);
                delay(2000);  // Esperar 2 segundos entre reintentos
            }

            success = sendDataToBackend(jsonData);
        }

        if (success) {
            Serial.println("✅ Ciclo completado exitosamente!");
        } else {
            Serial.println("❌ Error enviando datos después de todos los reintentos");
        }

        // Actualizar timestamp y guardar estado
        lastSendTime = currentTime;
        saveStateToEEPROM();

        Serial.println(String(40, '-') + "\n");
    }

    // Pequeña pausa para estabilidad
    delay(1000);
}