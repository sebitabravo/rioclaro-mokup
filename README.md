# 🌊 Sistema de Monitoreo Río Claro

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-green.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Sistema de monitoreo en tiempo real para los niveles de agua del **Río Claro - Región de La Araucanía, Chile**. Desarrollado con tecnologías modernas y **Clean Architecture** para el Gobierno de Chile.

## ✨ Características Destacadas

🔄 **Normalización Automática de Datos** - Cambia fuentes de datos sin modificar componentes
🎨 **Animaciones Fluidas** - Framer Motion con transiciones optimizadas
📊 **Gráficos Interactivos** - Recharts con datos en tiempo real
🗺️ **Mapas Interactivos** - Visualización geoespacial con Leaflet
📱 **Responsive Design** - Funciona perfectamente en móvil y desktop
🌙 **Modo Oscuro/Claro** - Sistema de temas integrado
📈 **Exportación Avanzada** - PDF, Excel, CSV con un click
🧪 **Testing E2E** - Playwright para garantizar calidad
⚡ **Rendimiento Optimizado** - Lazy loading y code splitting

## 🏗️ Arquitectura

El proyecto implementa **Clean Architecture** con inversión de dependencias:

```
src/
├── domain/              # 🎯 Entidades de negocio
│   ├── entities/        # Station, Measurement, Alert, Report, User
│   └── repositories/    # Contratos de acceso a datos
├── application/         # 📋 Casos de uso
│   └── use-cases/       # GenerateReports, GetMeasurements, etc.
├── infrastructure/      # 🔧 Adaptadores externos
│   ├── adapters/        # API clients y repositorios Mock
│   └── di/             # Container de inyección de dependencias
├── presentation/        # 🎨 Interfaz de usuario
│   ├── components/      # Componentes React organizados
│   ├── pages/          # Páginas con lazy loading
│   ├── stores/         # Estado global con Zustand
│   └── hooks/          # Custom hooks
├── shared/             # 🔄 Código compartido
│   ├── services/       # DataNormalization, Export, ReportActivity
│   ├── contexts/       # ThemeContext para dark/light mode
│   ├── types/          # Tipos TypeScript compartidos
│   └── utils/          # Utilidades generales
└── examples/           # 📖 Ejemplos y documentación
```

### Principios Arquitectónicos

- ✅ **Inversión de dependencias**: Capas internas independientes
- ✅ **Separación de responsabilidades**: Cada capa con propósito específico
- ✅ **Testabilidad**: Fácil testing con inyección de dependencias
- ✅ **Escalabilidad**: Estructura modular para crecimiento
- ✅ **Mantenibilidad**: Código limpio y bien organizado

## 🚀 Stack Tecnológico

### Frontend Core
- **React 19** - Biblioteca UI con mejoras de rendimiento
- **TypeScript 5.9** - Tipado estático robusto
- **Vite 6.0** - Build tool ultrarrápido con HMR
- **React Router DOM 6.28** - Enrutamiento con lazy loading

### UI y Diseño
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **Radix UI** - Componentes primitivos accesibles
- **Lucide React** - Iconografía moderna y consistente
- **Framer Motion 12.23** - Animaciones fluidas y profesionales

### Estado y Datos
- **Zustand 5.0** - Estado global simple y performante
- **React Hook Form 7.60** - Formularios eficientes
- **Zod 3.25** - Validación de esquemas TypeScript-first

### Visualización
- **Recharts 2.12** - Gráficos React nativos y responsivos
- **Leaflet 1.9** + **React Leaflet 5.0** - Mapas interactivos
- **jsPDF 3.0** + **XLSX 0.18** - Exportación PDF/Excel

### Herramientas de Desarrollo
- **Playwright 1.55** - Testing E2E cross-browser
- **ESLint 9.15** - Linting con reglas TypeScript
- **pnpm** - Package manager eficiente

## 🚀 Quick Start

### ⚡ Setup en 30 segundos

```bash
git clone https://github.com/sebitabravo/rioclaro-mokup.git
cd rioclaro-mokup
pnpm install
pnpm dev
```

**¡Listo!** Abre [http://localhost:5173](http://localhost:5173) 🎉

### 🐳 Quick Start con Docker (Stack Completo)

```bash
git clone https://github.com/sebitabravo/rioclaro-mokup.git
cd rioclaro-mokup
./deploy.sh dev
```

**Servicios disponibles:**
- 🌐 Frontend: [http://localhost:3000](http://localhost:3000)
- 🔌 API: [http://localhost:8000](http://localhost:8000)
- 👨‍💼 Admin: [http://localhost:8000/admin](http://localhost:8000/admin)

---

## 📦 Instalación Completa

### Prerequisitos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recomendado) o npm >= 8.0.0
- **Docker** >= 20.10 (opcional, para stack completo)

### Configuración Detallada

```bash
# 1. Clonar el repositorio
git clone https://github.com/sebitabravo/rioclaro-mokup.git
cd rioclaro-mokup

# 2. Instalar dependencias
pnpm install

# 3. (Opcional) Configurar variables de entorno
cp .env.development .env  # Usa valores por defecto seguros

# 4. Ejecutar en desarrollo
pnpm dev
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Servidor desarrollo (http://localhost:5173)
pnpm build            # Build producción con TypeScript check
pnpm preview          # Preview del build

# Testing
pnpm test             # Tests E2E con Playwright
pnpm test:ui          # Interfaz gráfica de tests
pnpm test:headed      # Tests con navegador visible

# Calidad de Código
pnpm lint             # Linting con ESLint
```

## 🎯 Funcionalidades Principales

### 📊 Dashboard en Tiempo Real
- Métricas y KPIs del estado del río
- Gráficos interactivos con Recharts
- Indicadores visuales de estado crítico
- Actualización automática de datos

### 🗺️ Mapas Interactivos
- Visualización de estaciones en mapa
- Marcadores animados por estado
- Información detallada en popups
- Navegación fluida entre estaciones

### 📈 Sistema de Reportes
- Generación de reportes personalizados
- Exportación a PDF, Excel, CSV
- Filtros avanzados por fecha y estación
- Visualización de datos históricos

### ⚠️ Sistema de Alertas
- Detección automática de niveles críticos
- Alertas visuales y notificaciones
- Configuración de umbrales personalizados
- Historial de alertas y resoluciones

### 👥 Administración
- Gestión de usuarios y permisos
- Configuración de estaciones
- Logs de actividad del sistema
- Panel de administración completo

## 🎨 Páginas y Rutas

```typescript
/                    # Página de inicio con información del sistema
/dashboard           # Dashboard principal con métricas en tiempo real
/reports            # Generación y exportación de reportes
/activity           # Logs de actividad y historial del sistema
/admin              # Panel de administración y configuración
```

## 🔄 Sistema de Normalización de Datos

Una de las características más potentes del sistema es la **normalización automática de datos**, que permite integrar múltiples fuentes de datos sin modificar componentes:

```typescript
// Cambiar fuente de datos en una línea
const chartData = DataNormalizationService.normalizeChartData(
  rawData, 
  DataSourceType.IOT_SENSOR  // o GOVERNMENT_API, CSV_HISTORICAL, etc.
);

// Los componentes siempre reciben el mismo formato
<NormalizedChart data={chartData} />
```

### Fuentes Soportadas
- **Sensores IoT** - Datos en tiempo real de sensores de campo
- **API Gubernamental** - Integración con sistemas oficiales
- **Datos Históricos CSV** - Importación de datos legacy
- **Datos Mock** - Para desarrollo y testing

## 🎬 Sistema de Animaciones

Animaciones elegantes y optimizadas que mejoran la UX:

- **Transiciones de página** fluidas con AnimatePresence
- **Lazy loading** con indicadores de carga animados
- **Feedback visual** para estados críticos
- **Mapas interactivos** con marcadores animados
- **Gráficos progresivos** que se dibujan gradualmente
- **Mascota emocional** que refleja el estado del río

## 🧪 Testing y Calidad

### Testing E2E con Playwright

```bash
# Ejecutar todos los tests
pnpm test

# Tests específicos
pnpm test tests/dashboard-performance.spec.ts
pnpm test tests/animation-performance.spec.ts
pnpm test tests/cross-browser-performance.spec.ts
```

### Cobertura de Tests
- ✅ Rendimiento de animaciones
- ✅ Funcionalidad cross-browser
- ✅ Performance del dashboard
- ✅ Normalización de datos
- ✅ Navegación y flujos de usuario
- ✅ Exportación de reportes

## 📁 Estructura de Archivos Destacada

```
rioclaro-mokup/
├── src/
│   ├── domain/entities/
│   │   ├── Station.ts           # Entidad estación de monitoreo
│   │   ├── Measurement.ts       # Mediciones con filtros
│   │   └── Alert.ts            # Sistema de alertas
│   ├── presentation/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx     # Página de inicio animada
│   │   │   ├── DashboardPage.tsx # Dashboard principal
│   │   │   └── ReportsPage.tsx  # Generación de reportes
│   │   ├── components/
│   │   │   ├── charts/          # Gráficos con Recharts
│   │   │   ├── maps/           # Componentes de mapas
│   │   │   └── ui/             # Sistema de diseño
│   │   └── stores/
│   │       ├── StationStore.ts  # Estado de estaciones
│   │       └── MeasurementStore.ts # Estado de mediciones
│   └── shared/services/
│       ├── DataNormalizationService.ts # Normalización de datos
│       ├── ExportService.ts            # Exportación PDF/Excel
│       └── ReportActivityService.ts    # Logs del sistema
├── tests/                      # Tests E2E con Playwright
├── docs/                       # Documentación completa
└── scripts/                    # Scripts de utilidad
```

## 🌟 Casos de Uso

### Para Operadores del Sistema
- Monitoreo en tiempo real del nivel del río
- Recepción de alertas automáticas
- Generación de reportes operativos
- Visualización en mapas interactivos

### Para Administradores
- Gestión de usuarios y permisos
- Configuración de estaciones y umbrales
- Análisis de datos históricos
- Exportación de reportes ejecutivos

### Para Autoridades Gubernamentales
- Dashboards ejecutivos con KPIs
- Reportes automáticos programados
- Integración con sistemas existentes
- Datos normalizados para análisis

## 🚀 Deployment

### 🐳 Deployment con Docker (Recomendado)

El sistema RíoClaro incluye un **script de deployment automatizado** para desarrollo y producción:

```bash
# Despliegue en desarrollo
./deploy.sh dev

# Despliegue en producción
./deploy.sh prod --build

# Ver todas las opciones disponibles
./deploy.sh --help
```

#### Stack Docker Completo

- **MySQL 8.0** - Base de datos principal
- **Django REST API** - Backend con configuración por entorno
- **React + Vite** - Frontend optimizado
- **Redis** - Cache y cola de tareas (opcional)
- **Arduino Simulator** - Simulador de sensores IoT

### 📋 Configuración de Entornos

#### Desarrollo (`.env.development`)
```bash
# Configuración automática para desarrollo local
DJANGO_ENVIRONMENT=development
DEBUG=True
DB_ENGINE=django.db.backends.sqlite3
CORS_ALLOW_ALL_ORIGINS=True
DATA_SOURCE=SIMULATOR
SESSION_TIMEOUT_MINUTES=1440  # 24 horas
```

#### Producción (`.env.production`)
```bash
# Configuración segura para producción
DJANGO_ENVIRONMENT=production
DEBUG=False
SECRET_KEY=CHANGE_THIS_SECRET_KEY_FOR_PRODUCTION
DB_ENGINE=django.db.backends.mysql
DB_NAME=rioclaro_prod
DB_USER=rioclaro_user
DB_PASSWORD=STRONG_PRODUCTION_PASSWORD
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SESSION_TIMEOUT_MINUTES=480   # 8 horas
SECURE_SSL_REDIRECT=True
```

### 🛠️ Comandos de Deployment

```bash
# DESARROLLO
./deploy.sh dev                    # Iniciar desarrollo
./deploy.sh dev --fresh            # Inicio limpio (reconstruye todo)
./deploy.sh dev logs               # Ver logs en tiempo real
./deploy.sh dev backup             # Crear backup de desarrollo

# PRODUCCIÓN
./deploy.sh prod --build           # Desplegar en producción
./deploy.sh prod restart --logs    # Reiniciar y mostrar logs
./deploy.sh prod backup            # Backup automático con timestamp
./deploy.sh prod status            # Estado de servicios

# GESTIÓN DE SERVICIOS
./deploy.sh down                   # Detener todos los servicios
./deploy.sh build --fresh          # Reconstruir imágenes desde cero
```

### 🔐 Configuración de Seguridad (Producción)

#### Variables Críticas a Configurar

```bash
# 1. Clave secreta Django (generar nueva)
SECRET_KEY=your-super-secret-key-minimum-50-chars

# 2. Credenciales de base de datos
DB_PASSWORD=strong-database-password
DB_HOST=your-database-host

# 3. Configuración de dominio
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# 4. Email para notificaciones
EMAIL_HOST=smtp.yourdomain.com
EMAIL_HOST_USER=noreply@yourdomain.com
EMAIL_HOST_PASSWORD=your-email-password

# 5. Monitoreo de errores
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

#### Políticas de Seguridad Incluidas

- ✅ **Passwords seguros**: Longitud mínima, mayúsculas, números, símbolos
- ✅ **Timeout de sesión**: 8 horas en producción vs 24h en desarrollo
- ✅ **Headers de seguridad**: HSTS, CSP, X-Frame-Options
- ✅ **Rate limiting**: Protección contra ataques de fuerza bruta
- ✅ **Audit logs**: Registro completo de actividades de usuarios
- ✅ **Backup automático**: Retención configurable con encriptación

### 🗄️ Gestión de Base de Datos

```bash
# Crear backup
./deploy.sh prod backup

# Restaurar desde backup
./deploy.sh prod restore backup_prod_20231201_143022.sql

# Migrar base de datos
docker-compose -f docker/docker-compose.yml exec backend python manage.py migrate

# Crear superusuario
docker-compose -f docker/docker-compose.yml exec backend python manage.py createsuperuser
```

### 📊 Monitoreo y Logs

```bash
# Ver logs de todos los servicios
./deploy.sh logs

# Logs específicos por servicio
docker-compose -f docker/docker-compose.yml logs backend
docker-compose -f docker/docker-compose.yml logs frontend
docker-compose -f docker/docker-compose.yml logs mysql

# Logs en tiempo real
./deploy.sh dev --logs
```

### 🔧 Configuración de Servidor (Producción)

#### Requisitos del Servidor

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **RAM** >= 4GB (recomendado 8GB)
- **Disk** >= 20GB SSD
- **CPU** >= 2 cores

#### Puertos Utilizados

- **3000** - Frontend React
- **8000** - Backend Django API
- **3306** - MySQL Database
- **6379** - Redis (opcional)

### 🌐 Configuración de Dominio

```nginx
# Configuración Nginx para producción
upstream backend {
    server localhost:8000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 🚀 Deployment paso a paso

#### Para Desarrollo

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/sebitabravo/rioclaro-mokup.git
   cd rioclaro-mokup
   ```

2. **Configurar entorno**
   ```bash
   # El archivo .env.development ya está configurado
   ./deploy.sh dev
   ```

3. **Acceder al sistema**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000
   - Admin: http://localhost:8000/admin

#### Para Producción

1. **Configurar variables de entorno**
   ```bash
   # Editar .env.production con valores reales
   nano .env.production
   ```

2. **Desplegar**
   ```bash
   ./deploy.sh prod --build
   ```

3. **Configurar SSL y dominio**
   ```bash
   # Configurar reverse proxy (Nginx/Apache)
   # Configurar certificados SSL
   ```

4. **Crear usuario administrador**
   ```bash
   docker-compose -f docker/docker-compose.yml exec backend python manage.py createsuperuser
   ```

### 📱 Variables de Entorno Frontend

```env
# Frontend (desarrollo)
VITE_API_URL=http://localhost:8000
VITE_APP_ENV=development

# Frontend (producción)
VITE_API_URL=https://api.yourdomain.com
VITE_APP_ENV=production
VITE_MAP_DEFAULT_CENTER_LAT=-38.7359
VITE_MAP_DEFAULT_CENTER_LNG=-72.5904
```

## 📚 Documentación

La documentación está completamente reorganizada y categorizada en `/docs`:

### 📖 [Índice Principal de Documentación](docs/README.md)

### Por Categorías:

- 🚀 [**Getting Started**](docs/getting-started/) - Quick start y configuración inicial
- 🏗️ [**Architecture**](docs/architecture/) - Diseño y estructura del sistema
- 🛠️ [**Development**](docs/development/) - Guías de desarrollo y convenciones
- ✨ [**Features**](docs/features/) - Funcionalidades específicas (Animaciones, Data Normalization, Admin Panel)
- 🔌 [**API Reference**](docs/api/) - Documentación completa de la REST API
- 🔧 [**Backend**](docs/backend/) - Django setup y configuración
- ⚡ [**Performance**](docs/performance/) - Optimización y rendimiento
- 📘 [**Guides**](docs/guides/) - Guías avanzadas (TypeScript, State Management, etc.)

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código

- **ESLint**: Seguir reglas de linting configuradas
- **TypeScript**: Tipado estricto obligatorio
- **Commits**: Usar conventional commits
- **Tests**: Agregar tests para nuevas funcionalidades

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Sebastian Bravo** - [@sebitabravo](https://github.com/sebitabravo)

---

## 🙏 Agradecimientos

- **Gobierno de Chile** - Región de La Araucanía
- **Comunidad Open Source** - Por las increíbles herramientas
- **React Team** - Por React 19 y sus mejoras
- **Vercel Team** - Por Next.js inspiration y tooling

---

<div align="center">

**⭐ Si este proyecto te resulta útil, considera darle una estrella en GitHub ⭐**

[🌊 Ver Demo](https://rioclaro-mokup.vercel.app) • [📚 Documentación](docs/) • [🐛 Reportar Bug](issues/) • [💡 Solicitar Feature](issues/)

</div>