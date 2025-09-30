# API Endpoints - Sistema de Monitoreo de Río Claro

## 📋 Autenticación

### Obtener Token
- **POST** `/api/auth/token/`
  ```json
  {
    "username": "admin@rioclaro.com",
    "password": "admin123"
  }
  ```

### Headers para Requests Autenticados
```
Authorization: Token <tu_token_aqui>
Content-Type: application/json
```

## 👥 Gestión de Usuarios (RF1.1)

### Listar Usuarios
- **GET** `/api/users/`

### Crear Usuario (Solo Administradores)
- **POST** `/api/users/`
  ```json
  {
    "username": "usuario123",
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "password": "password123",
    "role": "technician"
  }
  ```

### Obtener/Editar/Eliminar Usuario
- **GET/PUT/PATCH/DELETE** `/api/users/{id}/`

### Obtener Roles Disponibles
- **GET** `/api/users/roles/`

## 🏭 Gestión de Estaciones (RF1.2)

### Listar Estaciones
- **GET** `/api/stations/`

### Crear Estación (Solo Administradores)
- **POST** `/api/stations/`
  ```json
  {
    "name": "Estación Río Norte",
    "code": "RIO_001",
    "latitude": "-34.12345678",
    "longitude": "-58.87654321",
    "description": "Estación de monitoreo principal"
  }
  ```

### Obtener/Editar/Eliminar Estación
- **GET/PUT/PATCH/DELETE** `/api/stations/{id}/`

## 🔗 Asignación de Estaciones (RF1.4)

### Asignar Usuario a Estación
- **POST** `/api/stations/{station_id}/assign_user/`
  ```json
  {
    "user_id": 2
  }
  ```

### Desasignar Usuario de Estación
- **DELETE** `/api/stations/{station_id}/unassign_user/`
  ```json
  {
    "user_id": 2
  }
  ```

### Obtener Asignaciones de una Estación
- **GET** `/api/stations/{station_id}/assignments/`

### Listar Todas las Asignaciones
- **GET** `/api/station-assignments/`

## 🚫 Validaciones Implementadas (RF1.3)

### Usuarios
- ❌ No se puede eliminar el último administrador
- ❌ Un usuario no puede eliminarse a sí mismo
- ❌ Email debe ser único
- ✅ Solo administradores pueden gestionar usuarios

### Estaciones
- ❌ No se puede eliminar estaciones con sensores activos
- ❌ Código de estación debe ser único
- ✅ Solo administradores pueden gestionar estaciones

## 📊 Ejemplos de Uso

### 1. Autenticarse
```bash
curl -X POST http://localhost:8000/api/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@rioclaro.com", "password": "admin123"}'
```

### 2. Crear una Estación
```bash
curl -X POST http://localhost:8000/api/stations/ \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Estación Río Norte",
    "code": "RIO_001",
    "latitude": "-34.12345678",
    "longitude": "-58.87654321"
  }'
```

### 3. Crear un Usuario Técnico
```bash
curl -X POST http://localhost:8000/api/users/ \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tecnico1",
    "email": "tecnico1@rioclaro.com",
    "first_name": "Pedro",
    "last_name": "García",
    "password": "password123",
    "role": "technician"
  }'
```

### 4. Asignar Usuario a Estación
```bash
curl -X POST http://localhost:8000/api/stations/1/assign_user/ \
  -H "Authorization: Token TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 2}'
```

## 🔐 Roles de Usuario

- **admin**: Puede gestionar usuarios, estaciones y asignaciones
- **technician**: Puede ver estaciones asignadas y datos
- **observer**: Solo puede ver datos de estaciones asignadas

## 🛠️ Panel de Administración

Accede al panel de Django Admin en: `http://localhost:8000/admin/`
- Usuario: `admin@rioclaro.com`
- Contraseña: `admin123`

## ⚡ Iniciar Servidor

```bash
source env/bin/activate
python manage.py runserver
```

El servidor estará disponible en: `http://localhost:8000/`