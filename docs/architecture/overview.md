# 🏗️ Arquitectura del Sistema - Monitoreo Río Claro

## Visión General

El sistema combina **Clean Architecture** con **Feature-based Architecture**, optimizado para React 19 y TypeScript. Implementa lazy loading, animaciones fluidas, testing integral y exportación avanzada de reportes.

## Arquitectura Híbrida Actualizada

### 🎯 Núcleo Clean Architecture

- **Domain Layer**: Entidades y reglas de negocio centralizadas
- **Application Layer**: Casos de uso y lógica de aplicación
- **Infrastructure Layer**: Adaptadores, APIs y dependencias externas

### 🏢 Feature-based Organization

- **Modularidad**: Cada feature es autónoma con sus stores, componentes y tests
- **Escalabilidad**: Fácil agregar nuevas funcionalidades sin afectar el resto
- **Testing**: Tests unitarios integrados por feature + E2E con Playwright

## Estructura Actualizada del Proyecto

```typescript
rioclaro-mokup/
├── src/
│   ├── domain/                 # 🎯 Capa de Dominio (Centralizada)
│   │   ├── entities/          # Entidades de negocio
│   │   │   ├── User.ts        # Usuario del sistema
│   │   │   ├── Station.ts     # Estación de monitoreo
│   │   │   ├── Measurement.ts # Mediciones con filtros
│   │   │   ├── Alert.ts       # Sistema de alertas
│   │   │   ├── Report.ts      # Reportes generados
│   │   │   └── ActivityLog.ts # Logs de actividad
│   │   └── repositories/      # Contratos de repositorios
│   │
│   ├── application/           # 📋 Capa de Aplicación (Centralizada)
│   │   └── use-cases/         # Casos de uso principales
│   │       ├── GenerateReports.ts
│   │       ├── GetMeasurements.ts
│   │       ├── GetStations.ts
│   │       └── ManageUsers.ts
│   │
│   ├── infrastructure/        # 🔧 Capa de Infraestructura (Centralizada)
│   │   ├── adapters/          # Adaptadores y clientes
│   │   │   ├── ApiClient.ts
│   │   │   ├── ApiStationRepository.ts
│   │   │   └── Mock*Repository.ts (múltiples)
│   │   └── di/                # Inyección de dependencias
│   │       └── Container.ts
│   │
│   ├── features/              # 🏢 Features Modulares (NUEVO)
│   │   ├── dashboard/         # Feature Dashboard
│   │   │   ├── components/    # Componentes específicos
│   │   │   │   ├── __tests__/ # Tests unitarios
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   └── MetricsDashboard.tsx
│   │   │   ├── hooks/         # Hooks personalizados
│   │   │   │   └── __tests__/ # Tests de hooks
│   │   │   └── stores/        # Estado específico de dashboard
│   │   │       └── MeasurementStore.ts
│   │   ├── reports/           # Feature Reportes
│   │   │   ├── components/
│   │   │   │   ├── ReportExportButton.tsx
│   │   │   │   └── NormalizedChart.tsx
│   │   │   └── stores/
│   │   │       └── ReportStore.ts
│   │   ├── admin/             # Feature Administración
│   │   │   └── stores/
│   │   │       ├── UserStore.ts
│   │   │       └── StationStore.ts
│   │   ├── activity/          # Feature Actividad
│   │   │   └── components/
│   │   │       └── ActivityExportButton.tsx
│   │   └── home/              # Feature Página Principal
│   │
│   ├── presentation/          # 🎨 Componentes Compartidos
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── ui/            # Design System base
│   │   │   ├── layout/        # Navbar y estructura general
│   │   │   ├── charts/        # Gráficos compartidos
│   │   │   └── maps/          # StationsMap con Leaflet
│   │   └── pages/             # Páginas con lazy loading
│   │       ├── HomePage.tsx
│   │       ├── DashboardPage.tsx
│   │       ├── ReportsPage.tsx
│   │       ├── ActivityReportPage.tsx
│   │       └── AdminPage.tsx
│   │   │   ├── MeasurementStore.ts
│   │   │   ├── ReportStore.ts
│   │   │   └── UserStore.ts
│   │   └── hooks/             # Custom hooks de presentación
│   │
│   ├── shared/                # 🔄 Código Compartido
│   │   ├── components/        # MotionWrapper y reutilizables
│   │   ├── contexts/          # ThemeContext (dark/light mode)
│   │   ├── hooks/             # useBrowserDetect y hooks globales
│   │   ├── services/          # Servicios transversales
│   │   │   ├── DataNormalizationService.ts
│   │   │   ├── ExportService.ts (PDF/Excel)
│   │   │   └── ReportActivityService.ts
│   │   ├── types/             # Tipos TypeScript compartidos
│   │   │   ├── animation-types.ts
│   │   │   ├── chart-data.ts
│   │   │   ├── data-types.ts
│   │   │   └── motion-types.ts
│   │   └── utils/             # Funciones de utilidad
│   │
│   ├── examples/              # 📖 Ejemplos de uso
│   └── styles/                # 🎨 Estilos globales
│       └── cross-browser-animations.css
│
├── tests/                     # 🧪 Testing E2E con Playwright
├── docs/                      # 📚 Documentación completa
└── scripts/                   # 🔧 Scripts de utilidad
```

## 🎯 Capa de Dominio (`src/domain/`)

### Responsabilidades

- Contiene la **lógica de negocio pura** sin dependencias externas
- Define las **entidades** principales del sistema con tipado estricto
- Establece **contratos** para repositorios y servicios
- **No depende** de ninguna otra capa

### Entidades Principales

#### `Station.ts`

```typescript
export interface Station {
  id: number;
  name: string;
  location: string;
  code: string;
  status: 'active' | 'maintenance' | 'inactive';
  latitude: number;
  longitude: number;
  current_level: number;
  threshold: number;
  last_measurement: string;
  created_at: string;
  updated_at: string;
}
```

#### `Measurement.ts`

```typescript
export interface Measurement {
  id: number;
  station_id: number;
  station_name?: string;
  variable_type: string;
  value: number;
  unit: string;
  timestamp: string;
  is_critical: boolean;
  quality?: 'good' | 'fair' | 'poor';
}

export interface MeasurementFilters {
  stationId?: number;
  startDate?: string;
  endDate?: string;
  variableType?: string;
  isCritical?: boolean;
}
```

#### `Alert.ts`

```typescript
export interface Alert {
  id: number;
  station_id: number;
  type: 'water_level' | 'sensor_failure' | 'communication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_active: boolean;
  created_at: string;
  resolved_at?: string;
}
```

#### `Report.ts`

```typescript
export interface Report {
  id: number;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  station_ids: number[];
  date_range: {
    start: string;
    end: string;
  };
  generated_at: string;
  generated_by: number;
  file_path?: string;
}
```

#### `User.ts`

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  created_at: string;
  last_login?: string;
  is_active: boolean;
}
```

#### `ActivityLog.ts`

```typescript
export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  resource_type: string;
  resource_id?: number;
  details: string;
  timestamp: string;
  ip_address?: string;
}
```

## 📋 Capa de Aplicación (`src/application/`)

### Responsabilidades de la Aplicación

- Contiene los **casos de uso** del sistema
- Orquesta las **entidades de dominio**
- Define la **lógica de aplicación**
- **Independiente** de frameworks y UI

### Casos de Uso Principales

```typescript
// GenerateReports.ts - Generación de reportes
// GetMeasurements.ts - Obtención y filtrado de mediciones
// GetStations.ts - Gestión de estaciones
// ManageUsers.ts - Administración de usuarios
```

## 🔧 Capa de Infraestructura (`src/infrastructure/`)

### Responsabilidades de la Infraestructura

- Implementa los **repositorios** definidos en dominio
- Maneja **comunicación externa** (APIs, servicios)
- Proporciona **inyección de dependencias**
- **Depende** del dominio pero **no** de presentación

#### `ApiClient.ts`

Cliente HTTP centralizado para comunicación con backend:

```typescript
export class ApiClient {
  private baseURL: string;
  private timeout: number;

  async get<T>(endpoint: string): Promise<T>;
  async post<T>(endpoint: string, data: any): Promise<T>;
  async put<T>(endpoint: string, data: any): Promise<T>;
  async delete<T>(endpoint: string): Promise<T>;
}
```

#### `Container.ts`

Contenedor de inyección de dependencias:

```typescript
export class Container {
  private dependencies = new Map();

  register<T>(token: string, implementation: T): void;
  resolve<T>(token: string): T;
}
```

#### Repositorios Mock

Implementaciones de prueba para desarrollo:

- `MockStationRepository.ts`
- `MockMeasurementRepository.ts`
- `MockAlertRepository.ts`
- `MockReportRepository.ts`
- `MockUserRepository.ts`
- `MockActivityLogRepository.ts`

## 🎨 Capa de Presentación (`src/presentation/`)

### Responsabilidades de la Presentación

- **Interfaz de usuario** con React 19
- **Estado global** con Zustand
- **Enrutamiento** con React Router
- **Animaciones** con Framer Motion

### Páginas Principales

#### `HomePage.tsx`

Página de inicio con información del sistema y navegación animada.

#### `DashboardPage.tsx`

Dashboard principal con métricas en tiempo real:

- Gráficos interactivos con Recharts
- Indicadores de rendimiento (KPIs)
- Datos de estaciones en tiempo real
- Alertas activas

#### `ReportsPage.tsx`

Generación y exportación de reportes:

- Filtros avanzados por fecha y estación
- Exportación a PDF y Excel
- Visualización de datos históricos

#### `ActivityReportPage.tsx`

Logs de actividad del sistema:

- Historial de acciones de usuarios
- Filtros por tipo de actividad
- Exportación de logs

#### `AdminPage.tsx`

Panel de administración:

- Gestión de usuarios
- Configuración de estaciones
- Configuración de alertas

### Stores (Estado Global)

#### `StationStore.ts`

```typescript
interface StationState {
  stations: Station[];
  selectedStation: Station | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchStations: () => Promise<void>;
  selectStation: (station: Station) => void;
  createStation: (data: CreateStationData) => Promise<void>;
  updateStation: (id: number, data: UpdateStationData) => Promise<void>;
}
```

#### `MeasurementStore.ts`

```typescript
interface MeasurementState {
  measurements: Measurement[];
  filters: MeasurementFilters;
  loading: boolean;
  error: string | null;

  // Actions
  fetchMeasurements: () => Promise<void>;
  setFilters: (filters: Partial<MeasurementFilters>) => void;
  refreshData: () => Promise<void>;
}
```

### Componentes por Categoría

#### `components/ui/`

Componentes base del sistema de diseño:

- `Button`, `Input`, `Card` - Componentes básicos
- `ThemeToggle` - Cambio de tema claro/oscuro
- `PageLoading` - Indicador de carga
- `ExportButton` - Botón de exportación
- `WaterMascot` - Mascota animada del sistema

#### `components/layout/`

Componentes de estructura:

- `Navbar` - Navegación principal con tema adaptativo

#### `components/charts/`

Componentes de visualización:

- `MetricsDashboard` - Dashboard de métricas principales
- `NormalizedChart` - Gráficos con datos normalizados
- `MetricChart` - Gráficos individuales de métricas
- `MiniTrendChart` - Gráficos pequeños de tendencias

#### `components/maps/`

Componentes de mapas:

- `StationsMap` - Mapa interactivo con ubicaciones de estaciones

## 🔄 Capa Compartida (`src/shared/`)

### Servicios Transversales

#### `DataNormalizationService.ts`

Servicio para normalización automática de datos:

```typescript
export class DataNormalizationService {
  normalizeChartData(data: any[], sourceType: DataSourceType): ChartDataSet;
  transformMeasurements(measurements: Measurement[]): ChartDataPoint[];
}
```

#### `ExportService.ts`

Servicio de exportación a múltiples formatos:

```typescript
export class ExportService {
  exportToPDF(data: any[], options: ExportOptions): Promise<void>;
  exportToExcel(data: any[], options: ExportOptions): Promise<void>;
  exportToCSV(data: any[], options: ExportOptions): Promise<void>;
}
```

#### `ReportActivityService.ts`

Servicio de logs de actividad:

```typescript
export class ReportActivityService {
  logActivity(action: string, details: any): Promise<void>;
  getActivityHistory(filters: any): Promise<ActivityLog[]>;
}
```

### Contextos y Hooks

#### `ThemeContext.tsx`

Contexto para manejo de temas:

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

#### `useBrowserDetect.ts`

Hook para detección de navegador y capacidades.

### Tipos TypeScript

#### `animation-types.ts`

Tipos para animaciones con Framer Motion.

#### `chart-data.ts`

Tipos para datos de gráficos y visualizaciones.

#### `data-types.ts`

Tipos compartidos para datos del dominio.

#### `motion-types.ts`

Tipos para componentes con animaciones.

## 🔄 Flujo de Datos

### Arquitectura Unidireccional

```mermaid
graph TD
    A[UI Components] --> B[Zustand Stores]
    B --> C[Use Cases]
    C --> D[Domain Entities]
    C --> E[Repositories]
    E --> F[External APIs/Services]
    F --> E
    E --> C
    C --> B
    B --> A
```

### Flujo de Operaciones

1. **Componente UI** dispara una acción
2. **Store Zustand** maneja el estado
3. **Caso de Uso** ejecuta lógica de negocio
4. **Repositorio** accede a datos externos
5. **Entidades de Dominio** validan y procesan datos
6. **Resultado** se propaga de vuelta al UI

## 🎯 Principios Arquitectónicos

### Clean Architecture

- **Inversión de dependencias**: Las capas internas no dependen de las externas
- **Separación de responsabilidades**: Cada capa tiene un propósito específico
- **Testabilidad**: Fácil testing mediante inyección de dependencias
- **Escalabilidad**: Estructura modular que facilita el crecimiento

### Optimizaciones de Rendimiento

- **Lazy Loading**: Páginas cargadas bajo demanda
- **Code Splitting**: División automática de bundles
- **Memoización**: React.memo y useMemo estratégicos
- **Animaciones Optimizadas**: Framer Motion con GPU acceleration

### Patrones de Diseño

- **Repository Pattern**: Abstracción de acceso a datos
- **Dependency Injection**: Inversión de control
- **Observer Pattern**: Estado reactivo con Zustand
- **Facade Pattern**: Servicios que encapsulan complejidad
- **Strategy Pattern**: DataNormalizationService para diferentes fuentes

## 🧪 Testing y Calidad

### Playwright E2E Testing

```typescript
// tests/ - Testing end-to-end
├── animation-performance.spec.ts
├── cross-browser-performance.spec.ts
├── dashboard-performance.spec.ts
├── data-normalization.spec.ts
├── general-app.spec.ts
└── reports-chart.spec.ts
```

### Configuraciones de Calidad

- **ESLint**: Linting con reglas TypeScript y React
- **TypeScript Strict**: Tipado estricto en toda la aplicación
- **Path Mapping**: Imports absolutos para mejor organización

## 🚀 Deployment y Build

### Configuración Vite

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, './src/domain'),
      '@application': path.resolve(__dirname, './src/application'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@shared': path.resolve(__dirname, './src/shared'),
    }
  }
})
```

### Scripts de Build

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  }
}
```

## 🏢 Arquitectura de Features (`src/features/`)

### Organización Modular

Cada feature encapsula su funcionalidad completa con:

- **Componentes específicos** del dominio
- **Stores de estado** localizados
- **Hooks personalizados** para lógica compartida
- **Tests unitarios** integrados por feature

### Features Principales

#### `dashboard/`

Feature principal del sistema de monitoreo:

```typescript
dashboard/
├── components/
│   ├── __tests__/
│   │   └── MetricCard.test.tsx     # Tests unitarios con Vitest
│   ├── MetricCard.tsx              # Tarjeta de métricas individual
│   ├── MetricsDashboard.tsx        # Dashboard principal
│   ├── DashboardHeader.tsx         # Header con filtros
│   ├── MetricsGrid.tsx             # Grid de métricas
│   ├── MiniTrendChart.tsx          # Gráfico de tendencia mini
│   └── StationsMap.tsx             # Mapa de estaciones
├── hooks/
│   ├── __tests__/                  # Tests de hooks
│   └── useDashboardData.ts         # Hook de datos del dashboard
└── stores/
    └── MeasurementStore.ts         # Estado específico de mediciones
```

#### `reports/`

Feature de generación y exportación de reportes:

```typescript
reports/
├── components/
│   ├── ReportExportButton.tsx      # Botón de exportación avanzado
│   ├── NormalizedChart.tsx         # Gráficos normalizados
│   └── MetricChart.tsx             # Gráficos de métricas
└── stores/
    └── ReportStore.ts              # Estado de reportes
```

#### `admin/`

Feature de administración del sistema:

```typescript
admin/
└── stores/
    ├── UserStore.ts                # Gestión de usuarios
    └── StationStore.ts             # Gestión de estaciones
```

#### `activity/`

Feature de logs y actividad del sistema:

```typescript
activity/
└── components/
    └── ActivityExportButton.tsx    # Exportación de logs
```

### Ventajas de esta Arquitectura

1. **Mantenimiento**: Cada feature es independiente y fácil de modificar
2. **Testing**: Tests integrados por feature facilitan TDD
3. **Escalabilidad**: Nuevas features se agregan sin conflictos
4. **Colaboración**: Múltiples desarrolladores pueden trabajar en paralelo
5. **Reutilización**: Componentes compartidos en `presentation/`

## 🧪 Estrategia de Testing

### Testing Unitario con Vitest

- **Framework**: Vitest con jsdom para testing de React
- **Testing Library**: React Testing Library para interacciones
- **Cobertura**: Integrada con c8/v8 para métricas
- **Setup**: Configuración global en `vitest.config.ts`

### Testing E2E con Playwright

- **Cobertura completa**: Flujos de usuario end-to-end
- **Cross-browser**: Chrome, Firefox, Safari
- **Performance**: Métricas de rendimiento automatizadas
- **Reports**: Reportes visuales con capturas

### Arquitectura de Tests

```typescript
src/
├── features/
│   └── dashboard/
│       ├── components/
│       │   └── __tests__/          # Tests unitarios por componente
│       └── hooks/
│           └── __tests__/          # Tests de hooks personalizados
├── test/
│   └── setup.ts                   # Configuración global de tests
└── tests/                         # Tests E2E con Playwright
    ├── dashboard-performance.spec.ts
    ├── reports-chart.spec.ts
    └── general-app.spec.ts
```

Esta arquitectura híbrida garantiza mantenibilidad, escalabilidad y calidad óptima para el sistema de monitoreo del Río Claro.
