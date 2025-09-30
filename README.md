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

# Ejecutar
pnpm dev
```

**¡Listo!** Abre [http://localhost:5173](http://localhost:5173) 🎉

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

## 📚 Documentación Completa

### 📖 **[Ver Documentación →](docs/README.md)**

**Rutas rápidas:**
- 🚀 [Getting Started](docs/getting-started/) - Setup e instalación
- 🏗️ [Architecture](docs/architecture/overview.md) - Clean Architecture explicada
- 🛠️ [Development](docs/development/setup.md) - Guía de desarrollo
- 🔌 [API Reference](docs/api/) - Documentación de REST API
- ✨ [Features](docs/features/) - Funcionalidades específicas

**¿Primera vez?** Sigue esta ruta:
1. [Quick Start](docs/getting-started/) → 2. [Architecture Overview](docs/architecture/overview.md) → 3. [Development Setup](docs/development/setup.md)

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