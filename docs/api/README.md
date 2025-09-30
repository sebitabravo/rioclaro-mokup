# 🔌 API Reference - Sistema RíoClaro

> Documentación completa de la REST API del sistema de monitoreo RíoClaro

## 📋 Tabla de Contenidos

- [Autenticación](./authentication.md)
- [Mediciones y Variables](./measurements.md)
- [Reportes](./reports.md)

---

## 🎯 Visión General

La API de RíoClaro está construida con Django REST Framework y proporciona endpoints completos para:

- 🔐 Autenticación y gestión de tokens
- 👥 Gestión de usuarios y permisos
- 🗺️ Gestión de estaciones de monitoreo
- 📊 Mediciones en tiempo real e históricas
- ⚠️ Sistema de alertas y umbrales
- 📈 Generación de reportes

---

## 🔑 Autenticación

Todos los endpoints requieren autenticación mediante token JWT.

### Obtener Token

```bash
POST /api/auth/token/
Content-Type: application/json

{
  "username": "admin@rioclaro.com",
  "password": "tu_password"
}
```

### Usar Token en Requests

```bash
Authorization: Token <tu_token_aqui>
Content-Type: application/json
```

**Ver documentación completa**: [Authentication](./authentication.md)

---

## 📊 Endpoints Principales

### Usuarios
- `GET /api/users/` - Listar usuarios
- `POST /api/users/` - Crear usuario
- `GET /api/users/{id}/` - Obtener usuario
- `PUT /api/users/{id}/` - Actualizar usuario
- `DELETE /api/users/{id}/` - Eliminar usuario

### Estaciones
- `GET /api/stations/` - Listar estaciones
- `POST /api/stations/` - Crear estación
- `GET /api/stations/{id}/` - Obtener estación
- `PUT /api/stations/{id}/` - Actualizar estación
- `DELETE /api/stations/{id}/` - Eliminar estación

### Mediciones
- `GET /api/measurements/` - Listar mediciones
- `GET /api/measurements/latest/` - Últimas mediciones
- `GET /api/measurements/historical/` - Datos históricos
- `POST /api/measurements/` - Crear medición

### Alertas
- `GET /api/alerts/` - Listar alertas
- `POST /api/alerts/` - Crear alerta
- `GET /api/alerts/active/` - Alertas activas
- `PUT /api/alerts/{id}/resolve/` - Resolver alerta

### Reportes
- `POST /api/reports/daily-average/` - Reporte de promedios diarios
- `POST /api/reports/critical-events/` - Reporte de eventos críticos
- `POST /api/reports/comparative/` - Reporte comparativo

**Ver detalles completos**: [Measurements](./measurements.md), [Reports](./reports.md)

---

## 🌐 Base URL

### Desarrollo
```
http://localhost:8000/api/
```

### Producción
```
https://api.rioclaro.gov.cl/api/
```

---

## 📝 Formato de Respuestas

Todas las respuestas de la API siguen este formato estándar:

### Éxito (200-299)

```json
{
  "id": 1,
  "nombre": "Estación Norte",
  "codigo": "EST-NORTE-01",
  "created_at": "2025-01-15T10:00:00Z"
}
```

### Error (400-599)

```json
{
  "error": "Mensaje de error descriptivo",
  "details": {
    "field": ["Error específico del campo"]
  }
}
```

---

## 🔄 Paginación

Los endpoints de lista soportan paginación:

```bash
GET /api/stations/?page=1&page_size=20
```

**Respuesta:**
```json
{
  "count": 100,
  "next": "http://api.example.com/stations/?page=2",
  "previous": null,
  "results": [...]
}
```

---

## 🔍 Filtros

Muchos endpoints soportan filtros por query params:

```bash
GET /api/measurements/?station_id=1&start_date=2025-01-01&end_date=2025-01-31
GET /api/users/?role=Técnico&is_active=true
GET /api/alerts/?severity=critical&status=active
```

---

## ⚠️ Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Eliminación exitosa |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o faltante |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

---

## 🚀 Rate Limiting

La API implementa rate limiting para proteger el servicio:

- **Autenticación**: 5 requests/minuto
- **API General**: 100 requests/minuto por usuario
- **Admin endpoints**: 20 requests/minuto

Si excedes el límite, recibirás un error `429 Too Many Requests`.

---

## 📚 Documentación por Módulo

### [🔐 Autenticación](./authentication.md)
- Obtención de tokens
- Registro de usuarios
- Gestión de permisos y roles

### [📊 Mediciones y Variables](./measurements.md)
- Datos en tiempo real
- Historial de mediciones
- Configuración de umbrales
- Sistema de alertas

### [📈 Reportes](./reports.md)
- Reportes de promedios diarios
- Reportes de eventos críticos
- Reportes comparativos entre estaciones

---

## 🛠️ Cliente API (Frontend)

El frontend utiliza un cliente API centralizado:

```typescript
// src/infrastructure/adapters/ApiClient.ts
import { apiClient } from '@infrastructure/adapters/ApiClient';

// Ejemplo de uso
const stations = await apiClient.get<Station[]>('/stations/');
const newStation = await apiClient.post<Station>('/stations/', stationData);
```

---

## 🧪 Testing de la API

### Con curl

```bash
# Obtener token
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Usar token
curl -X GET http://localhost:8000/api/stations/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Con Postman

Importa la colección de Postman desde:
```
docs/api/postman_collection.json
```

### Tests Automatizados

```bash
# Tests de API con Playwright
pnpm test:e2e tests/api/

# Tests unitarios de repositorios API
pnpm test:unit src/infrastructure/adapters/Api*
```

---

## 🔗 Ver También

- [Backend Django Setup](../backend/django-setup.md)
- [Development Guide](../development/setup.md)
- [Architecture Overview](../architecture/overview.md)

---

**Última actualización**: 2025-01-15
**Autor**: Sebastian Bravo
**Tags**: #api #rest #backend #django