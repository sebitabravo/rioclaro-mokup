# 🌊 Sistema de Monitoreo Río Claro

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-green.svg)](https://vitejs.dev)
[![Django](https://img.shields.io/badge/Django-4.x-green.svg)](https://www.djangoproject.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sistema de monitoreo en tiempo real para los niveles de agua del **Río Claro - Región de La Araucanía, Chile**. Desarrollado con **Clean Architecture**, **React 19**, **TypeScript** y **Django REST API**.

---

## 🚀 Quick Start

```bash
# Clonar e instalar
git clone https://github.com/sebitabravo/rioclaro-mokup.git
cd rioclaro-mokup
pnpm install

# Ejecutar en modo demo/mockup (sin backend)
pnpm dev:demo
```

**¡Listo!** Abre [http://localhost:5173](http://localhost:5173) 🎉

### Modos de ejecución

```bash
# Demo / Mockup (usa repositorios mock)
pnpm dev:demo

# API real (requiere backend disponible)
pnpm dev:api
```

### Con Docker (Stack Completo)

```bash
./deploy.sh dev
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Admin: http://localhost:8000/admin

---

## ✨ Características Principales

- 🔄 **Normalización de Datos** - Múltiples fuentes sin cambiar código
- 📊 **Gráficos en Tiempo Real** - Recharts interactivos
- 🗺️ **Mapas Interactivos** - Leaflet con marcadores animados
- ⚠️ **Sistema de Alertas** - Configurables por estación
- 📈 **Exportación** - PDF, Excel, CSV
- 👨‍💼 **Panel de Admin** - Gestión completa de usuarios y estaciones
- 🌙 **Dark Mode** - Tema adaptativo
- 🧪 **Testing E2E** - Playwright cross-browser

---

## 🏗️ Stack Tecnológico

### Frontend
**React 19** • **TypeScript 5.9** • **Vite 6** • **Tailwind CSS** • **Zustand** • **Framer Motion** • **Recharts** • **Leaflet**

### Backend
**Django 4.x** • **Django REST Framework** • **MySQL** • **Docker** • **Redis**

### Arquitectura
**Clean Architecture** • **Repository Pattern** • **Dependency Injection** • **Feature-based Organization**

---

## ⚙️ Configuración de Entorno

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# Base
VITE_ENVIRONMENT=development
VITE_API_URL=http://localhost:8000/api

# Frontend data source
# Valores válidos: MOCK | DEMO | MOCKUP | API
VITE_DATA_SOURCE=MOCK

# Backend
DJANGO_SETTINGS_MODULE=rioclaro_api.settings
SECRET_KEY=tu-clave-secreta-super-segura
DEBUG=True

# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rioclaro_db
DB_USER=rioclaro_user
DB_PASSWORD=tu-password

# Redis
REDIS_URL=redis://localhost:6379/0
```

### Base de Datos

```bash
# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE rioclaro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rioclaro_user'@'localhost' IDENTIFIED BY 'tu-password';
GRANT ALL PRIVILEGES ON rioclaro_db.* TO 'rioclaro_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔌 Endpoints Principales de API

### Autenticación
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/me/` - Usuario actual

### Mediciones
- `GET /api/measurements/` - Lista de mediciones (con filtros)
- `POST /api/measurements/` - Crear medición
- `GET /api/measurements/{id}/` - Detalle de medición

### Estaciones
- `GET /api/stations/` - Lista de estaciones
- `POST /api/stations/` - Crear estación
- `GET /api/stations/{id}/` - Detalle de estación

### Sensores
- `GET /api/sensors/` - Lista de tipos de sensores
- `POST /api/sensors/` - Crear tipo de sensor

### Reportes
- `GET /api/measurements/reports/` - Reportes con filtros
- `GET /api/measurements/reports/export/pdf/` - Exportar PDF
- `GET /api/measurements/reports/export/excel/` - Exportar Excel

### Activity Logs
- `GET /api/activity-logs/` - Lista de logs de actividad
- `GET /api/activity-logs/stats/` - Estadísticas de actividad

### Admin Panel
- `/admin/` - Panel de administración Django

---

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Frontend
pnpm install          # Instalar dependencias
pnpm dev:demo        # Servidor de desarrollo en modo demo/mockup
pnpm dev:api         # Servidor de desarrollo con API real
pnpm build           # Build de producción
pnpm build:production # Build forzado para despliegue (API + production)
pnpm preview         # Preview del build
pnpm lint            # Linting
pnpm test:unit       # Tests unitarios

# Backend
cd backend
python manage.py runserver    # Servidor Django
python manage.py makemigrations  # Crear migraciones
python manage.py migrate      # Aplicar migraciones
python manage.py createsuperuser  # Crear admin
python manage.py setup_initial_data  # Datos iniciales

# Docker
docker-compose up -d          # Levantar stack completo
docker-compose down           # Detener stack
docker-compose logs -f        # Ver logs
```

### Testing
```bash
# E2E completo
pnpm test:e2e

# Tests específicos
npx playwright test dashboard-performance.spec.ts
npx playwright test reports-chart.spec.ts

# Con UI de Playwright
npx playwright test --ui
```

### Simulador
```bash
cd arduino/simulator
python mock_arduino.py --station 1 --interval 30
```

---

## 🐛 Troubleshooting

### Problema: "Module not found" en frontend
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problema: Base de datos no conecta
- Verificar credenciales en `.env`
- Asegurar MySQL esté corriendo: `brew services start mysql`
- Crear DB manualmente si falla

### Problema: Tests fallan
```bash
# Limpiar cache
npx playwright install
pnpm test:e2e --headed  # Ver qué pasa
```

### Problema: Docker no inicia
```bash
docker system prune -a  # Limpiar todo
docker-compose up --build
```

### Problema: Arduino no envía datos
- Verificar WiFi credentials en `river_sensor.ino`
- Revisar IP del backend en el script
- Ver logs del simulador: `python mock_arduino.py --debug`

---

## 📚 Documentación Adicional

- [Arquitectura Clean](docs/architecture/overview.md)
- [Setup de Desarrollo](docs/development/setup.md)
- [API Reference](docs/api/)
- [Performance](docs/performance/)

---

## 📂 Estructura del Proyecto

```
rioclaro-mokup/
├── src/
│   ├── domain/              # Entidades y contratos
│   ├── application/         # Casos de uso
│   ├── infrastructure/      # Adaptadores (API, DI)
│   ├── presentation/        # React components
│   ├── features/            # Dashboard, Reports, Admin, Activity
│   └── shared/              # Utilidades y servicios
├── backend/                 # Django REST API
├── docs/                    # 📚 Documentación completa
├── tests/                   # Tests E2E con Playwright
└── docker/                  # Configuración Docker
```

---

## 🧪 Testing

```bash
# Tests unitarios
pnpm test:unit

# Tests E2E
pnpm test:e2e

# Tests completos
pnpm test:full
```

---

## 🚢 Deployment

### Desarrollo
```bash
./deploy.sh dev
```

### Producción
```bash
# 1. Configurar .env.production
# 2. Deploy
./deploy.sh prod --build
```

**Ver**: [Deployment Guide](docs/backend/django-setup.md#deployment)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

**Estándares**: [Coding Standards](docs/development/coding-standards.md) • [Git Workflow](docs/development/setup.md)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

**Sebastian Bravo** - [@sebitabravo](https://github.com/sebitabravo)

---

## 🙏 Agradecimientos

- **Gobierno de Chile** - Región de La Araucanía
- **React Team** - Por React 19
- **Django Team** - Por Django REST Framework
- **Comunidad Open Source**

---

<div align="center">

**⭐ Si este proyecto te resulta útil, dale una estrella en GitHub ⭐**

[📚 Documentación](docs/) • [🐛 Reportar Bug](https://github.com/sebitabravo/rioclaro-mokup/issues) • [💡 Solicitar Feature](https://github.com/sebitabravo/rioclaro-mokup/issues)

</div>
