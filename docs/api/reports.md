# 📊 Módulo 3: Reportes - API Endpoints

## 🎯 Requerimientos Implementados

Este módulo implementa completamente los siguientes requerimientos funcionales:

- **RF3.1** - Reporte de Promedios Diarios ✅
- **RF3.2** - Reporte de Eventos Críticos ✅
- **RF3.3** - Reporte Comparativo entre Estaciones ✅

---

## 🔑 Autenticación

Todos los endpoints requieren autenticación. Incluir el header:
```
Authorization: Token <tu_token_aqui>
```

---

## 📈 RF3.1 - Reporte de Promedios Diarios

### Generar Reporte de Promedios Diarios
- **GET** `/api/measurements/reports/daily-averages/`
- **Descripción**: Genera un reporte con los promedios diarios de mediciones para un rango de fechas
- **Permisos**: Solo estaciones asignadas (excepto administradores)

**Parámetros Requeridos:**
- `date_from`: Fecha desde (YYYY-MM-DD)
- `date_to`: Fecha hasta (YYYY-MM-DD)

**Parámetros Opcionales:**
- `station_id`: ID de estación específica (si no se especifica incluye todas las accesibles)
- `measurement_type`: Tipo de medición (water_level, flow_rate, temperature, ph) - por defecto: water_level

**Ejemplo de Request:**
```
GET /api/measurements/reports/daily-averages/?date_from=2024-01-15&date_to=2024-01-30&measurement_type=water_level&station_id=1
```

**Ejemplo de Respuesta:**
```json
{
  "report_info": {
    "type": "daily_averages",
    "date_from": "2024-01-15",
    "date_to": "2024-01-30",
    "measurement_type": "water_level",
    "station_filter": 1,
    "total_records": 16
  },
  "results": [
    {
      "date": "2024-01-15",
      "station_id": 1,
      "station_name": "Estación Río Norte",
      "station_code": "RIO_001",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "avg_value": "245.75",
      "min_value": "230.20",
      "max_value": "260.80",
      "count_measurements": 96,
      "unit": "cm"
    },
    {
      "date": "2024-01-16",
      "station_id": 1,
      "station_name": "Estación Río Norte",
      "station_code": "RIO_001",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "avg_value": "248.50",
      "min_value": "235.10",
      "max_value": "265.20",
      "count_measurements": 96,
      "unit": "cm"
    }
  ]
}
```

---

## 🚨 RF3.2 - Reporte de Eventos Críticos

### Generar Reporte de Eventos Críticos
- **GET** `/api/measurements/reports/critical-events/`
- **Descripción**: Genera un reporte de todas las mediciones que han superado umbrales críticos o de advertencia
- **Permisos**: Solo estaciones asignadas (excepto administradores)

**Parámetros Requeridos:**
- `date_from`: Fecha desde (YYYY-MM-DD)
- `date_to`: Fecha hasta (YYYY-MM-DD)

**Parámetros Opcionales:**
- `station_id`: ID de estación específica
- `level`: Nivel de umbral (warning, critical, emergency)

**Ejemplo de Request:**
```
GET /api/measurements/reports/critical-events/?date_from=2024-01-15&date_to=2024-01-30&level=critical&station_id=1
```

**Ejemplo de Respuesta:**
```json
{
  "report_info": {
    "type": "critical_events",
    "date_from": "2024-01-15",
    "date_to": "2024-01-30",
    "station_filter": 1,
    "level_filter": "critical",
    "total_events": 3
  },
  "results": [
    {
      "event_id": 15,
      "timestamp": "2024-01-28T14:30:00Z",
      "station_id": 1,
      "station_name": "Estación Río Norte",
      "station_code": "RIO_001",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "measured_value": "305.80",
      "unit": "cm",
      "threshold_level": "critical",
      "threshold_level_display": "Crítico",
      "threshold_exceeded": {
        "warning_min": "200.00",
        "warning_max": "280.00",
        "critical_min": "180.00",
        "critical_max": "300.00"
      },
      "alert_status": "resolved",
      "alert_status_display": "Resuelta",
      "alert_title": "Umbral critical superado en Estación Río Norte",
      "alert_message": "El valor 305.80 cm de Nivel de Agua ha superado el umbral critical configurado (300.00 cm).",
      "duration_minutes": 125
    },
    {
      "event_id": 12,
      "timestamp": "2024-01-22T09:15:00Z",
      "station_id": 1,
      "station_name": "Estación Río Norte",
      "station_code": "RIO_001",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "measured_value": "310.20",
      "unit": "cm",
      "threshold_level": "critical",
      "threshold_level_display": "Crítico",
      "threshold_exceeded": {
        "warning_min": "200.00",
        "warning_max": "280.00",
        "critical_min": "180.00",
        "critical_max": "300.00"
      },
      "alert_status": "dismissed",
      "alert_status_display": "Descartada",
      "alert_title": "Umbral critical superado en Estación Río Norte",
      "alert_message": "El valor 310.20 cm de Nivel de Agua ha superado el umbral critical configurado (300.00 cm).",
      "duration_minutes": 45
    }
  ]
}
```

---

## 📊 RF3.3 - Reporte Comparativo entre Estaciones

### Generar Reporte Comparativo
- **GET** `/api/measurements/reports/comparative/`
- **Descripción**: Genera un reporte comparativo de mediciones entre múltiples estaciones para análisis y gráficos
- **Permisos**: Solo estaciones asignadas (excepto administradores)

**Parámetros Requeridos:**
- `date_from`: Fecha desde (YYYY-MM-DD)
- `date_to`: Fecha hasta (YYYY-MM-DD)
- `stations`: IDs de estaciones separados por coma (ej: 1,2,3)

**Parámetros Opcionales:**
- `measurement_type`: Tipo de medición (water_level, flow_rate, temperature, ph) - por defecto: water_level
- `aggregation`: Tipo de agregación (daily, hourly) - por defecto: daily

**Ejemplo de Request:**
```
GET /api/measurements/reports/comparative/?date_from=2024-01-15&date_to=2024-01-20&stations=1,2,3&measurement_type=water_level&aggregation=daily
```

**Ejemplo de Respuesta:**
```json
{
  "report_info": {
    "type": "comparative",
    "date_from": "2024-01-15",
    "date_to": "2024-01-20",
    "measurement_type": "water_level",
    "aggregation": "daily",
    "stations_included": [
      {
        "id": 1,
        "name": "Estación Río Norte",
        "code": "RIO_001",
        "location": "Norte del Río"
      },
      {
        "id": 2,
        "name": "Estación Río Sur",
        "code": "RIO_002",
        "location": "Sur del Río"
      },
      {
        "id": 3,
        "name": "Estación Central",
        "code": "RIO_003",
        "location": "Centro de la Ciudad"
      }
    ],
    "total_records": 18
  },
  "results": [
    {
      "time_period": "2024-01-15",
      "station_id": 1,
      "station_name": "Estación Río Norte",
      "station_code": "RIO_001",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "avg_value": "245.75",
      "min_value": "230.20",
      "max_value": "260.80",
      "count_measurements": 96,
      "unit": "cm",
      "aggregation_type": "daily"
    },
    {
      "time_period": "2024-01-15",
      "station_id": 2,
      "station_name": "Estación Río Sur",
      "station_code": "RIO_002",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "avg_value": "220.30",
      "min_value": "210.50",
      "max_value": "235.20",
      "count_measurements": 94,
      "unit": "cm",
      "aggregation_type": "daily"
    },
    {
      "time_period": "2024-01-15",
      "station_id": 3,
      "station_name": "Estación Central",
      "station_code": "RIO_003",
      "measurement_type": "water_level",
      "measurement_type_display": "Nivel de Agua",
      "avg_value": "235.60",
      "min_value": "225.10",
      "max_value": "250.40",
      "count_measurements": 95,
      "unit": "cm",
      "aggregation_type": "daily"
    }
  ]
}
```

---

## 🔍 Códigos de Estado HTTP

- **200 OK**: Reporte generado exitosamente
- **400 Bad Request**: Error en la validación de parámetros
- **401 Unauthorized**: Token de autenticación requerido
- **403 Forbidden**: Sin permisos para acceder a las estaciones solicitadas
- **404 Not Found**: No se encontraron datos para los criterios especificados
- **500 Internal Server Error**: Error interno del servidor

---

## 🚀 Ejemplos de Uso Completos

### 1. Reporte de Promedios Diarios para una Estación
```bash
curl -X GET "http://localhost:8000/api/measurements/reports/daily-averages/?date_from=2024-01-15&date_to=2024-01-30&station_id=1&measurement_type=water_level" \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. Reporte de Eventos Críticos del Último Mes
```bash
curl -X GET "http://localhost:8000/api/measurements/reports/critical-events/?date_from=2024-01-01&date_to=2024-01-31&level=critical" \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Reporte Comparativo Semanal entre 3 Estaciones
```bash
curl -X GET "http://localhost:8000/api/measurements/reports/comparative/?date_from=2024-01-15&date_to=2024-01-21&stations=1,2,3&aggregation=daily" \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Reporte de Promedios por Hora para Análisis Detallado
```bash
curl -X GET "http://localhost:8000/api/measurements/reports/comparative/?date_from=2024-01-20&date_to=2024-01-20&stations=1,2&aggregation=hourly&measurement_type=temperature" \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📋 Casos de Uso Típicos

### 1. Dashboard de Análisis Histórico
Los reportes de promedios diarios son ideales para mostrar tendencias a largo plazo en dashboards administrativos.

### 2. Sistema de Alertas Retrospectivo
Los reportes de eventos críticos permiten analizar patrones de alertas y evaluar la efectividad de los umbrales configurados.

### 3. Gráficos Comparativos
Los reportes comparativos proporcionan datos perfectamente estructurados para gráficos de líneas múltiples comparando estaciones.

### 4. Informes Gerenciales
Todos los reportes incluyen información contextual (nombres de estaciones, tipos de medición, etc.) para generar informes ejecutivos.

---

## 🔧 Características Técnicas

### Optimizaciones de Rendimiento
- Consultas con agregaciones SQL nativas (AVG, MIN, MAX, COUNT)
- Select_related para evitar N+1 queries
- Filtros optimizados por índices de base de datos
- Solo se procesan mediciones con quality_flag='good'

### Validaciones Implementadas
- Validación de formato de fechas (YYYY-MM-DD)
- Verificación de rangos de fechas lógicos
- Validación de parámetros de agregación
- Control de acceso por rol de usuario

### Permisos Basados en Roles
- **Administradores**: Acceso a todas las estaciones y reportes
- **Técnicos/Observadores**: Solo reportes de estaciones asignadas
- Filtrado automático de datos según permisos

### Estructura de Respuesta Consistente
Todos los reportes siguen el mismo patrón:
- `report_info`: Metadatos del reporte generado
- `results`: Array de datos del reporte
- Información contextual de estaciones incluidas

### Escalabilidad
- Agregaciones a nivel de base de datos para manejo eficiente de grandes volúmenes
- Paginación implícita a través de filtros de fecha
- Respuestas optimizadas para consumo por APIs frontend

---

## 📊 Tipos de Medición Soportados

- **water_level**: Nivel de Agua (cm)
- **flow_rate**: Caudal (m³/s)
- **temperature**: Temperatura (°C)
- **ph**: pH (unidades)

---

## ⏰ Tipos de Agregación Temporal

### Daily (Diario)
- Agrupa mediciones por día calendario
- Formato: YYYY-MM-DD
- Ideal para análisis de tendencias semanales/mensuales

### Hourly (Por Hora)
- Agrupa mediciones por hora
- Formato: YYYY-MM-DD HH:00:00
- Ideal para análisis de patrones diarios detallados

---

¡El Módulo 3: Reportes está completamente implementado y listo para usar! 🎉

**Endpoints Disponibles:**
- `/api/measurements/reports/daily-averages/` - Promedios diarios
- `/api/measurements/reports/critical-events/` - Eventos críticos
- `/api/measurements/reports/comparative/` - Reportes comparativos

**Próximos Pasos Recomendados:**
1. Integrar con frontend para visualización de gráficos
2. Implementar exportación a PDF/Excel de reportes
3. Configurar cache Redis para reportes frecuentes
4. Agregar más tipos de agregación (semanal, mensual)