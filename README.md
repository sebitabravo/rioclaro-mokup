# Sistema de Monitoreo de Río Claro

## 📋 Descripción General

Sistema de monitoreo en tiempo real para los niveles de agua del Río Claro, desarrollado con **Vite + React + TypeScript** y **Clean Architecture**. El sistema permite visualizar datos de estaciones de monitoreo, generar alertas cuando se superan umbrales críticos, y crear reportes históricos.

**✨ Característica destacada**: Sistema de **normalización automática de datos** que permite cambiar fuentes de datos sin modificar componentes.

## 🏗️ Arquitectura

El proyecto utiliza **Clean Architecture** con las siguientes capas:

```
src/
├── domain/           # Entidades de negocio y contratos
├── application/      # Casos de uso y lógica de aplicación  
├── infrastructure/   # Adaptadores e implementaciones
├── presentation/     # UI, componentes React y stores
├── shared/          # Utilidades y servicios compartidos
└── examples/        # Ejemplos de uso y documentación
```

### Principios de la Arquitectura

- **Inversión de dependencias**: Las capas internas no dependen de las externas
- **Separación de responsabilidades**: Cada capa tiene un propósito específico
- **Testabilidad**: Fácil testing mediante inyección de dependencias
- **Escalabilidad**: Estructura modular que facilita el crecimiento

## 🚀 Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Lucide Icons
- **Estado**: Zustand
- **Gráficos**: Recharts
- **Routing**: React Router DOM
- **Mapas**: Leaflet + React Leaflet
- **Arquitectura**: Clean Architecture con DI Container

## Instalación

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo
pnpm run dev

# Construir para producción
pnpm run build

# Vista previa de producción
pnpm run preview

# Linting
pnpm run lint
```

## Características

### Módulo 1: Registro (RF1.1-RF1.4)
- ✅ Registro de usuarios con roles (Administrador, Técnico, Observador)
- ✅ Registro de estaciones con nombre, ubicación y código
- ✅ Edición y eliminación de usuarios y estaciones
- ✅ Asignación de estaciones a usuarios

### Módulo 2: Variables (RF2.1-RF2.5)
- ✅ Visualización en tiempo real del nivel de agua
- ✅ Almacenamiento periódico de mediciones
- ✅ Historial de mediciones por fecha
- ✅ Configuración de umbrales críticos
- ✅ Generación de alertas visuales

### Módulo 3: Reportes (RF3.1-RF3.3)
- ✅ Reporte de niveles promedio por día
- ✅ Reporte de eventos críticos
- ✅ Reporte comparativo por estaciones

### Módulo 4: Gestión Adicional (RF4.1-RF4.4)
- ✅ Preparado para integrar nuevos sensores
- ✅ Muestra por defecto solo nivel de agua
- ✅ Panel para activar/desactivar módulos extras
- ✅ Visualización de nuevas variables

## Páginas

- **/** - Página de inicio con información del sistema
- **/dashboard** - Dashboard principal con estadísticas en tiempo real
- **/stations** - Lista y estado de estaciones de monitoreo
- **/alerts** - Gestión de alertas y configuración
- **/reports** - Generación y exportación de reportes
- **/admin** - Administración de usuarios y estaciones

## Configuración

### Variables de Entorno

Crea un archivo `.env` con:

```env
VITE_API_URL=http://localhost:8000/api
```

### Conexión con Backend Real

Para conectar con un backend real, reemplaza las implementaciones Mock en `src/infrastructure/di/Container.ts`:

```typescript
// Cambiar de:
this._stationRepository = new MockStationRepository();

// A:
this._stationRepository = new ApiStationRepository(apiClient);
```

## Desarrollo

### Estructura de Componentes

```
src/presentation/
├── components/
│   ├── ui/           # Componentes base (Button, Card, etc.)
│   └── layout/       # Componentes de layout (Navbar)
├── pages/            # Páginas principales
└── stores/           # Estado global con Zustand
```

### Añadir Nuevas Funcionalidades

1. **Crear entidad** en `src/domain/entities/`
2. **Definir repositorio** en `src/domain/repositories/`
3. **Implementar caso de uso** en `src/application/use-cases/`
4. **Crear adaptador** en `src/infrastructure/adapters/`
5. **Registrar en DI** en `src/infrastructure/di/Container.ts`
6. **Crear store** en `src/presentation/stores/`
7. **Implementar UI** en `src/presentation/`

## Licencia

Gobierno de Chile - Región de La Araucanía
