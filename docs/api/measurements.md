# 📊 Módulo 2: Gestión de Variables y Datos - API Endpoints

## 🎯 Requerimientos Implementados

Este módulo implementa completamente los siguientes requerimientos funcionales:

- **RF2.1** - Datos en Tiempo Real ✅
- **RF2.2** - Almacenamiento de Datos ✅
- **RF2.3** - Historial de Mediciones ✅
- **RF2.4** - Configuración de Umbrales ✅
- **RF2.5** - Generación de Alertas ✅

---

## 🔑 Autenticación

Todos los endpoints requieren autenticación. Incluir el header:
```
Authorization: Token <tu_token_aqui>
```

---

## 📡 RF2.1 - Datos en Tiempo Real

### Última Medición por Estación
- **GET** `/api/measurements/stations/{station_id}/latest/`
- **Descripción**: Obtiene la última medición de una estación específica
- **Permisos**: Solo estaciones asignadas (excepto administradores)

**Ejemplo de Respuesta:**
```json
{
  "id": 123,
  "station_name": "Estación Río Norte",
  "station_code": "RIO_001",
  "sensor_name": "Sensor Nivel Agua",
  "measurement_type": "water_level",
  "measurement_type_display": "Nivel de Agua",
  "value": "245.50",
  "unit": "cm",
  "timestamp": "2024-01-15T10:30:00Z",
  "time_since_measurement": "5 minutos"
}
```

### Últimas Mediciones de Todas las Estaciones
- **GET** `/api/measurements/latest/`
- **Descripción**: Obtiene las últimas mediciones de todas las estaciones accesibles
- **Permisos**: Filtra por estaciones asignadas según el rol

**Ejemplo de Respuesta:**
```json
[
  {
    "id": 123,
    "station_name": "Estación Río Norte",
    "station_code": "RIO_001",
    "sensor_name": "Sensor Nivel Agua",
    "measurement_type": "water_level",
    "value": "245.50",
    "unit": "cm",
    "timestamp": "2024-01-15T10:30:00Z",
    "time_since_measurement": "5 minutos"
  }
]
```

---

## 💾 RF2.2 - Almacenamiento de Datos

### Crear Medición Individual
- **POST** `/api/measurements/`
- **Descripción**: Endpoint principal para recibir mediciones desde sensores/PLC
- **Permisos**: Usuarios autenticados

**Payload:**
```json
{
  "station": 1,
  "sensor": 1,
  "measurement_type": "water_level",
  "value": "245.50",
  "raw_value": "2455",
  "unit": "cm",
  "quality_flag": "good",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "device_id": "PLC001",
    "signal_strength": 95
  }
}
```

**Respuesta (201 Created):**
```json
{
  "id": 123,
  "station": 1,
  "station_name": "Estación Río Norte",
  "sensor": 1,
  "sensor_name": "Sensor Nivel Agua",
  "measurement_type": "water_level",
  "value": "245.50",
  "raw_value": "2455",
  "unit": "cm",
  "quality_flag": "good",
  "timestamp": "2024-01-15T10:30:00Z",
  "received_at": "2024-01-15T10:30:05Z",
  "metadata": {
    "device_id": "PLC001",
    "signal_strength": 95
  }
}
```

### Crear Mediciones en Lote (Optimización PLC)
- **POST** `/api/measurements/batch/`
- **Descripción**: Crea múltiples mediciones en una sola transacción
- **Límite**: Máximo 1000 mediciones por lote

**Payload:**
```json
{
  "measurements": [
    {
      "station": 1,
      "sensor": 1,
      "measurement_type": "water_level",
      "value": "245.50",
      "unit": "cm",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "station": 1,
      "sensor": 2,
      "measurement_type": "temperature",
      "value": "18.5",
      "unit": "°C",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Respuesta (201 Created):**
```json
{
  "message": "Se crearon 2 mediciones exitosamente",
  "count": 2
}
```

---

## 📈 RF2.3 - Historial de Mediciones

### Lista de Mediciones con Filtros
- **GET** `/api/measurements/history/`
- **Descripción**: Historial paginado de mediciones con filtros avanzados
- **Paginación**: 50 elementos por página (max 1000)

**Parámetros de Filtro:**
- `date_from`: Fecha desde (YYYY-MM-DDTHH:MM:SSZ)
- `date_to`: Fecha hasta (YYYY-MM-DDTHH:MM:SSZ)
- `measurement_type`: Tipo de medición (water_level, flow_rate, temperature, ph)
- `station`: ID de la estación
- `sensor`: ID del sensor
- `quality_flag`: Indicador de calidad (good, suspect, poor, missing)
- `ordering`: Campo de ordenación (-timestamp, value, etc.)
- `page_size`: Elementos por página (max 1000)

**Ejemplo de Request:**
```
GET /api/measurements/history/?date_from=2024-01-15T00:00:00Z&date_to=2024-01-15T23:59:59Z&station=1&page_size=100&ordering=-timestamp
```

**Respuesta:**
```json
{
  "count": 250,
  "next": "http://localhost:8000/api/measurements/history/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "station": 1,
      "station_name": "Estación Río Norte",
      "station_code": "RIO_001",
      "sensor": 1,
      "sensor_name": "Sensor Nivel Agua",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "value": "245.50",
      "unit": "cm",
      "quality_flag": "good",
      "quality_flag_display": "Buena",
      "timestamp": "2024-01-15T10:30:00Z",
      "received_at": "2024-01-15T10:30:05Z",
      "is_recent": false
    }
  ]
}
```

### Detalle de Medición
- **GET** `/api/measurements/{id}/`
- **Descripción**: Información detallada de una medición específica

### Estadísticas de Mediciones
- **GET** `/api/measurements/statistics/`
- **Descripción**: Estadísticas agregadas por estación y tipo de medición

**Parámetros Opcionales:**
- `date_from`: Filtrar desde fecha
- `date_to`: Filtrar hasta fecha
- `station_id`: Filtrar por estación

**Respuesta:**
```json
[
  {
    "station_id": 1,
    "station_name": "Estación Río Norte",
    "measurement_type": "water_level",
    "measurement_type_display": "Nivel de Agua",
    "count": 1440,
    "avg_value": "235.75",
    "min_value": "185.20",
    "max_value": "298.90",
    "latest_timestamp": "2024-01-15T10:30:00Z",
    "unit": "cm"
  }
]
```

---

## ⚠️ RF2.4 - Configuración de Umbrales

### Lista y Creación de Umbrales
- **GET/POST** `/api/measurements/thresholds/`
- **Descripción**: Gestiona umbrales de alerta por estación y tipo de medición
- **Permisos**: Solo administradores y técnicos pueden crear/modificar

**Parámetros de Filtro (GET):**
- `station_id`: Filtrar por estación

**Payload (POST):**
```json
{
  "station": 1,
  "measurement_type": "water_level",
  "warning_min": "200.00",
  "warning_max": "280.00",
  "critical_min": "180.00",
  "critical_max": "300.00",
  "unit": "cm",
  "is_active": true,
  "notes": "Umbrales establecidos según histórico de crecidas"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "station": 1,
  "station_name": "Estación Río Norte",
  "station_code": "RIO_001",
  "measurement_type": "water_level",
  "measurement_type_display": "Nivel de Agua",
  "warning_min": "200.00",
  "warning_max": "280.00",
  "critical_min": "180.00",
  "critical_max": "300.00",
  "unit": "cm",
  "is_active": true,
  "notes": "Umbrales establecidos según histórico de crecidas",
  "created_by": 1,
  "created_by_name": "Administrador Sistema",
  "updated_by": null,
  "updated_by_name": null,
  "created_at": "2024-01-15T09:00:00Z",
  "updated_at": "2024-01-15T09:00:00Z"
}
```

### Detalle de Umbral
- **GET/PUT/PATCH/DELETE** `/api/measurements/thresholds/{id}/`
- **Descripción**: Gestiona umbrales específicos
- **Permisos**: DELETE solo administradores

---

## 🚨 RF2.5 - Sistema de Alertas

### Lista de Alertas
- **GET** `/api/measurements/alerts/`
- **Descripción**: Lista alertas con filtros y paginación

**Parámetros de Filtro:**
- `status`: Estado (active, acknowledged, resolved, dismissed)
- `level`: Nivel (info, warning, critical, emergency)
- `station_id`: Filtrar por estación
- `ordering`: Ordenación (-triggered_at, level, etc.)

**Respuesta:**
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "station": 1,
      "station_name": "Estación Río Norte",
      "station_code": "RIO_001",
      "measurement": 123,
      "measurement_value": "285.50",
      "measurement_unit": "cm",
      "threshold": 1,
      "level": "warning",
      "level_display": "Advertencia",
      "status": "active",
      "status_display": "Activa",
      "title": "Umbral warning superado en Estación Río Norte",
      "message": "El valor 285.50 cm de Nivel de Agua ha superado el umbral warning configurado.",
      "triggered_at": "2024-01-15T10:30:00Z",
      "acknowledged_at": null,
      "acknowledged_by": null,
      "acknowledged_by_name": null,
      "resolved_at": null,
      "resolved_by": null,
      "resolved_by_name": null,
      "resolution_notes": "",
      "metadata": {
        "value": "285.50",
        "unit": "cm",
        "threshold_level": "warning",
        "auto_generated": true
      },
      "duration_minutes": 15
    }
  ]
}
```

### Detalle de Alerta
- **GET** `/api/measurements/alerts/{id}/`
- **Descripción**: Información detallada de una alerta específica

### Acciones sobre Alertas
- **POST** `/api/measurements/alerts/{alert_id}/action/`
- **Descripción**: Ejecuta acciones sobre alertas (reconocer, resolver, descartar)

**Payload:**
```json
{
  "action": "acknowledge",
  "notes": "Alerta reconocida por el operador de turno"
}
```

**Acciones Disponibles:**
- `acknowledge`: Reconocer alerta activa
- `resolve`: Resolver alerta
- `dismiss`: Descartar alerta

**Respuesta:** Alerta actualizada con el nuevo estado

### Resumen de Alertas Activas
- **GET** `/api/measurements/alerts/active-summary/`
- **Descripción**: Resumen de alertas activas agrupadas por estación y nivel

**Respuesta:**
```json
[
  {
    "station_id": 1,
    "station_name": "Estación Río Norte",
    "total_alerts": 3,
    "by_level": {
      "info": 0,
      "warning": 2,
      "critical": 1,
      "emergency": 0
    }
  }
]
```

---

## ⚙️ Configuración de Mediciones

### Lista y Creación de Configuraciones
- **GET/POST** `/api/measurements/configurations/`
- **Descripción**: Configuración de parámetros de medición por estación
- **Permisos**: Solo administradores

**Payload (POST):**
```json
{
  "station": 1,
  "measurement_interval_minutes": 15,
  "data_retention_days": 365,
  "auto_alerts_enabled": true,
  "notification_email": "alertas@rioclaro.com"
}
```

### Detalle de Configuración
- **GET/PUT/PATCH** `/api/measurements/configurations/{id}/`
- **Descripción**: Gestiona configuraciones específicas

---

## 🎛️ Endpoints Adicionales para Dashboard

### Datos en Tiempo Real para Dashboard
- **GET** `/api/measurements/dashboard/latest/`
- **Descripción**: Alias optimizado para el dashboard frontend

### Panel de Alertas para Dashboard
- **GET** `/api/measurements/dashboard/alerts/`
- **Descripción**: Resumen de alertas optimizado para dashboard

---

## 🔍 Códigos de Estado HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error en la validación de datos
- **401 Unauthorized**: Token de autenticación requerido
- **403 Forbidden**: Sin permisos para acceder al recurso
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

---

## 🚀 Ejemplos de Uso Completos

### 1. Enviar Medición desde PLC
```bash
curl -X POST http://localhost:8000/api/measurements/ \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "station": 1,
    "sensor": 1,
    "measurement_type": "water_level",
    "value": "285.50",
    "unit": "cm",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

### 2. Configurar Umbrales
```bash
curl -X POST http://localhost:8000/api/measurements/thresholds/ \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "station": 1,
    "measurement_type": "water_level",
    "warning_max": "280.00",
    "critical_max": "300.00",
    "unit": "cm",
    "is_active": true
  }'
```

### 3. Reconocer una Alerta
```bash
curl -X POST http://localhost:8000/api/measurements/alerts/1/action/ \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "acknowledge",
    "notes": "Alerta verificada en campo"
  }'
```

### 4. Consultar Historial con Filtros
```bash
curl "http://localhost:8000/api/measurements/history/?date_from=2024-01-15T00:00:00Z&station=1&measurement_type=water_level&page_size=50" \
  -H "Authorization: Token TU_TOKEN"
```

---

## 🔧 Características Técnicas

### Automatización de Alertas (RF2.5)
- Las alertas se generan **automáticamente** al recibir mediciones que superan umbrales
- Sistema anti-spam: No se crean alertas duplicadas en la misma hora
- Metadatos incluyen información del valor que disparó la alerta

### Optimizaciones de Rendimiento
- Índices de base de datos en campos críticos (timestamp, station, etc.)
- Paginación automática en listas largas
- Select_related en consultas para evitar N+1 queries
- Filtros optimizados con django-filter

### Validaciones Implementadas
- Timestamps no pueden ser futuros
- Sensores deben pertenecer a la estación especificada
- Umbrales críticos deben ser más restrictivos que los de advertencia
- Prevención de mediciones duplicadas exactas

### Permisos Basados en Roles
- **Administradores**: Acceso total a todas las estaciones y configuraciones
- **Técnicos**: Pueden configurar umbrales en estaciones asignadas
- **Observadores**: Solo lectura de estaciones asignadas

¡El Módulo 2 está completamente implementado y listo para usar! 🎉