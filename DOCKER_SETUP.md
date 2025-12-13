# Docker Setup - RíoClaro

## Overview

El proyecto usa un único `docker-compose.yml` en la raíz para orquestar todos los servicios.

## Estructura

```
docker-compose.yml          # Orquestación principal (ÚNICO ARCHIVO)
docker/
├── Dockerfile.backend       # Backend Django
├── Dockerfile.frontend      # Frontend React/Vite
├── mysql.cnf               # Configuración MySQL
└── nginx.conf              # Configuración Nginx
```

## Servicios

- **mysql**: Base de datos MySQL 8.0
- **redis**: Cache y broker de Celery
- **backend**: API Django (puerto 8000)
- **celery**: Worker de tareas asincrónicas
- **celery-beat**: Scheduler de tareas programadas
- **frontend**: React/Vite (puerto 5173)
- **nginx**: Reverse proxy (solo en producción)

## Uso

### Desarrollo

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Rebuild de imágenes
docker-compose build --no-cache
```

### Configuración

Editar `.env` en la raíz del proyecto. Variables principales:

- `MYSQL_*`: Credenciales de MySQL
- `REDIS_*`: Configuración de Redis
- `VITE_API_URL`: URL del backend para el frontend
- `SECRET_KEY`: Clave secreta de Django

## Notas

- El archivo `version` fue removido (deprecated en Docker Compose v2)
- Solo se mantienen los Dockerfiles actualmente en uso
- Los archivos `docker-compose.dev.yml` y `docker-compose.production.yml` fueron consolidados
