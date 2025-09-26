# Sistema de Monitoreo de Río Claro - Overview

## Propósito del Proyecto
Sistema de monitoreo en tiempo real para los niveles de agua del Río Claro desarrollado para el Gobierno de Chile - Región de La Araucanía. Permite visualizar datos de estaciones de monitoreo, generar alertas cuando se superan umbrales críticos, y crear reportes históricos.

## Característica Destacada
- **Sistema de normalización automática de datos** que permite cambiar fuentes de datos sin modificar componentes
- Arquitectura Clean Architecture con inversión de dependencias
- Preparado para integrar múltiples tipos de sensores

## Tech Stack Principal
- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Tailwind CSS + Radix UI + Lucide Icons  
- **Estado**: Zustand
- **Gráficos**: Recharts
- **Routing**: React Router DOM
- **Mapas**: Leaflet + React Leaflet
- **Arquitectura**: Clean Architecture con DI Container
- **Testing**: Playwright para E2E
- **Package Manager**: pnpm

## Páginas Principales
- **/** - Página de inicio con información del sistema
- **/dashboard** - Dashboard principal con estadísticas en tiempo real
- **/stations** - Lista y estado de estaciones de monitoreo
- **/alerts** - Gestión de alertas y configuración
- **/reports** - Generación y exportación de reportes
- **/admin** - Administración de usuarios y estaciones