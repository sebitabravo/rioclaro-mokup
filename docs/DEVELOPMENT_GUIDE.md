# 🛠️ Guía de Desarrollo - Sistema Monitoreo Río Claro

## 🚀 Configuración Inicial

### Prerrequisitos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recomendado) o npm >= 8.0.0
- **Git**
- Editor de código (VS Code recomendado con extensiones TypeScript y React)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/sebitabravo/rioclaro-mokup.git
cd rioclaro-mokup

# 2. Instalar dependencias (recomendado con pnpm)
pnpm install
# o con npm
npm install

# 3. Configurar variables de entorno (si es necesario)
cp .env.example .env.local

# 4. Ejecutar en desarrollo
pnpm dev
# o con npm
npm run dev
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev             # Servidor de desarrollo (http://localhost:5173)
npm run dev          # Alternativa con npm

# Build y Producción
pnpm build           # Build de producción con TypeScript check
npm run build        # Alternativa con npm
pnpm preview         # Preview del build de producción

# Linting y Calidad de Código
pnpm lint            # Linting con ESLint 9.15
eslint . --fix       # Fix automático de problemas

# Testing
pnpm test            # Tests E2E con Playwright
pnpm test:ui         # Interfaz UI de Playwright
pnpm test:headed     # Tests con navegador visible
pnpm test:unit       # Tests unitarios con Vitest
pnpm test:coverage   # Cobertura de tests unitarios
```

## ⚙️ Configuración del Entorno

### Variables de Entorno

Crear archivo `.env.local` (opcional para desarrollo):

```env
# API Configuration (si conectas a backend real)
VITE_API_URL=http://localhost:8000/api

# Map Configuration
VITE_MAP_DEFAULT_CENTER_LAT=-38.7359
VITE_MAP_DEFAULT_CENTER_LNG=-72.5904

# App Configuration
VITE_APP_NAME="Sistema Monitoreo Río Claro"
VITE_APP_VERSION="1.0.0"
```

### Configuración del Editor (VS Code)

Extensiones recomendadas (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

Configuración del workspace (`.vscode/settings.json`):

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🏗️ Arquitectura de Desarrollo

### Estructura de Carpetas para Desarrollo

```typescript
src/
├── domain/              # 🎯 Lógica de negocio pura
│   ├── entities/        # Interfaces y tipos de datos
│   └── repositories/    # Contratos de acceso a datos
│
├── application/         # 📋 Casos de uso
│   └── use-cases/       # Lógica de aplicación
│
├── infrastructure/      # 🔧 Implementaciones externas
│   ├── adapters/        # Repositorios Mock y API
│   └── di/             # Inyección de dependencias
│
├── features/           # � Features modulares (NUEVO)
│   ├── dashboard/      # Feature Dashboard
│   │   ├── components/ # Componentes específicos
│   │   │   └── __tests__/  # Tests unitarios
│   │   ├── hooks/      # Hooks personalizados
│   │   │   └── __tests__/  # Tests de hooks
│   │   └── stores/     # Estado específico
│   ├── reports/        # Feature Reportes
│   ├── admin/          # Feature Administración
│   └── activity/       # Feature Actividad
│
├── presentation/        # 🎨 Componentes compartidos
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas con lazy loading
│   └── hooks/          # Custom hooks globales
│
├── shared/             # 🔄 Utilidades compartidas
│   ├── services/       # Servicios transversales
│   ├── contexts/       # Contextos React
│   ├── hooks/          # Hooks globales
│   ├── types/          # Tipos TypeScript
│   └── utils/          # Funciones de utilidad
│
├── test/               # 🧪 Configuración de testing
│   └── setup.ts        # Setup global de Vitest
│
└── examples/           # 📖 Ejemplos de uso
```

### Alias de Importación

El proyecto usa path mapping para importaciones absolutas:

```typescript
// tsconfig.json configurado con:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["./src/domain/*"],
      "@application/*": ["./src/application/*"],
      "@infrastructure/*": ["./src/infrastructure/*"],
      "@features/*": ["./src/features/*"],
      "@presentation/*": ["./src/presentation/*"],
      "@shared/*": ["./src/shared/*"]
    }
  }
}
```

Ejemplos de uso:

```typescript
// ✅ Correcto - Import absoluto
import { Station } from '@domain/entities/Station'
import { useMeasurementStore } from '@features/dashboard/stores/MeasurementStore'
import { MetricCard } from '@features/dashboard/components/MetricCard'
import { DataNormalizationService } from '@shared/services/DataNormalizationService'

// ❌ Evitar - Import relativo largo
import { Station } from '../../../domain/entities/Station'
import { MetricCard } from '../../features/dashboard/components/MetricCard'
```

## 🎨 Desarrollo de Componentes

### Estructura de Componentes

```typescript
// Estructura recomendada para un componente
src/presentation/components/charts/MetricChart.tsx

import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '@presentation/components/ui/card'
import { Measurement } from '@domain/entities/Measurement'

interface MetricChartProps {
  data: Measurement[]
  title: string
  loading?: boolean
}

export const MetricChart: React.FC<MetricChartProps> = ({
  data,
  title,
  loading = false
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        {/* Contenido del componente */}
      </Card>
    </motion.div>
  )
}
```

### Convenciones de Nomenclatura

```typescript
// Componentes - PascalCase
export const MetricsDashboard = () => {}

// Hooks - camelCase con prefijo 'use'
export const useStationData = () => {}

// Stores - camelCase con sufijo 'Store'
export const useStationStore = () => {}

// Tipos/Interfaces - PascalCase
interface StationData {}
type ChartType = 'line' | 'bar'

// Constantes - UPPER_SNAKE_CASE
const API_ENDPOINTS = {}

// Funciones - camelCase
export const normalizeData = () => {}
```

### Sistema de Diseño con Tailwind

```typescript
// Uso de clases de Tailwind organizadas
<div className={cn(
  // Layout
  "flex flex-col gap-4 p-6",
  // Responsive
  "md:flex-row md:gap-6 md:p-8",
  // Theme
  "bg-white dark:bg-gray-900",
  "border border-gray-200 dark:border-gray-700",
  // Estados
  "hover:shadow-lg transition-shadow duration-200",
  // Condicionales
  loading && "opacity-50 pointer-events-none"
)}
```

## 📊 Desarrollo de Páginas

### Lazy Loading de Páginas

```typescript
// App.tsx - Lazy loading implementado
const HomePage = lazy(() => import('@presentation/pages/HomePage')
  .then(m => ({ default: m.HomePage })))

const DashboardPage = lazy(() => import('@presentation/pages/DashboardPage')
  .then(m => ({ default: m.DashboardPage })))
```

### Estructura de una Página

```typescript
// src/presentation/pages/ExamplePage.tsx
import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@presentation/components/layout/Navbar'
import { useStationStore } from '@presentation/stores/StationStore'

export const ExamplePage: React.FC = () => {
  const { stations, fetchStations, loading } = useStationStore()

  useEffect(() => {
    fetchStations()
  }, [fetchStations])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Contenido de la página */}
      </motion.main>
    </div>
  )
}
```

## 🗄️ Manejo de Estado con Zustand

### Creación de Stores

```typescript
// src/presentation/stores/ExampleStore.ts
import { create } from 'zustand'
import { Station } from '@domain/entities/Station'

interface StationState {
  // Estado
  stations: Station[]
  selectedStation: Station | null
  loading: boolean
  error: string | null

  // Acciones
  fetchStations: () => Promise<void>
  selectStation: (station: Station) => void
  createStation: (data: CreateStationData) => Promise<void>
  updateStation: (id: number, data: UpdateStationData) => Promise<void>
  clearError: () => void
}

export const useStationStore = create<StationState>((set, get) => ({
  // Estado inicial
  stations: [],
  selectedStation: null,
  loading: false,
  error: null,

  // Implementación de acciones
  fetchStations: async () => {
    set({ loading: true, error: null })
    try {
      // Lógica de fetch usando casos de uso
      const stations = await getStationsUseCase.execute()
      set({ stations, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  selectStation: (station) => set({ selectedStation: station }),

  clearError: () => set({ error: null })
}))
```

### Uso en Componentes

```typescript
const StationList: React.FC = () => {
  const {
    stations,
    loading,
    error,
    fetchStations,
    selectStation
  } = useStationStore()

  useEffect(() => {
    fetchStations()
  }, [fetchStations])

  if (loading) return <PageLoading />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-4">
      {stations.map(station => (
        <StationCard
          key={station.id}
          station={station}
          onClick={() => selectStation(station)}
        />
      ))}
    </div>
  )
}
```

## 🎯 Casos de Uso y Servicios

### Implementación de Casos de Uso

```typescript
// src/application/use-cases/GetStations.ts
import { Station } from '@domain/entities/Station'
import { StationRepository } from '@domain/repositories/StationRepository'

export class GetStationsUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(): Promise<Station[]> {
    try {
      const stations = await this.stationRepository.findAll()
      return stations.filter(station => station.status === 'active')
    } catch (error) {
      throw new Error(`Error fetching stations: ${error.message}`)
    }
  }

  async executeById(id: number): Promise<Station | null> {
    return await this.stationRepository.findById(id)
  }
}
```

### Servicios Compartidos

```typescript
// src/shared/services/ExportService.ts
export class ExportService {
  static async exportToPDF(data: any[], options: ExportOptions): Promise<void> {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    // Lógica de exportación
    doc.save(`${options.filename}.pdf`)
  }

  static async exportToExcel(data: any[], options: ExportOptions): Promise<void> {
    const XLSX = await import('xlsx')
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')
    XLSX.writeFile(workbook, `${options.filename}.xlsx`)
  }
}
```

## 🎨 Animaciones con Framer Motion

### Variantes de Animación

```typescript
// src/shared/types/animation-types.ts
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
}

export const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.1 }
  }
}
```

### Componentes Animados

```typescript
// Wrapper de animación reutilizable
import { motion } from 'framer-motion'
import { pageVariants } from '@shared/types/animation-types'

export const AnimatedPage: React.FC<{ children: React.ReactNode }> = ({
  children
}) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={{ type: 'tween', ease: 'easeInOut', duration: 0.2 }}
  >
    {children}
  </motion.div>
)
```

## 🗺️ Integración con Mapas (Leaflet)

### Configuración del Mapa

```typescript
// src/presentation/components/maps/StationsMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Station } from '@domain/entities/Station'

interface StationsMapProps {
  stations: Station[]
  onStationClick?: (station: Station) => void
}

export const StationsMap: React.FC<StationsMapProps> = ({
  stations,
  onStationClick
}) => {
  const defaultCenter = [-38.7359, -72.5904] // La Araucanía, Chile

  return (
    <MapContainer
      center={defaultCenter}
      zoom={10}
      className="h-96 w-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {stations.map(station => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          eventHandlers={{
            click: () => onStationClick?.(station)
          }}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{station.name}</h3>
              <p>Nivel actual: {station.current_level}m</p>
              <p>Estado: {station.status}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
```

## 📊 Gráficos con Recharts

### Configuración de Gráficos

```typescript
// src/presentation/components/charts/WaterLevelChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface WaterLevelChartProps {
  data: ChartDataPoint[]
  height?: number
}

export const WaterLevelChart: React.FC<WaterLevelChartProps> = ({
  data,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis
          dataKey="timestamp"
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          label={{ value: 'Nivel (m)', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip
          formatter={(value, name) => [`${value}m`, 'Nivel de agua']}
          labelFormatter={(value) => new Date(value).toLocaleString()}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

## 🧪 Testing Integral

### Testing Unitario con Vitest

#### Configuración de Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      "@": "/src",
      "@domain": "/src/domain",
      "@application": "/src/application",
      "@infrastructure": "/src/infrastructure",
      "@presentation": "/src/presentation",
      "@shared": "/src/shared",
      "@features": "/src/features",
    },
  },
});
```

#### Setup Global de Tests

```typescript
// src/test/setup.ts
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

#### Ejemplo de Test Unitario

```typescript
// src/features/dashboard/components/__tests__/MetricCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MetricCard } from '../MetricCard'

describe('MetricCard', () => {
  it('renders metric value correctly', () => {
    render(
      <MetricCard
        title="Nivel de Agua"
        value="2.5"
        unit="m"
        trend="up"
      />
    )

    expect(screen.getByText('Nivel de Agua')).toBeInTheDocument()
    expect(screen.getByText('2.5')).toBeInTheDocument()
    expect(screen.getByText('m')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(
      <MetricCard
        title="Nivel de Agua"
        value="2.5"
        unit="m"
        loading={true}
      />
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })
})
```

#### Testing de Hooks Personalizados

```typescript
// src/features/dashboard/hooks/__tests__/useDashboardData.test.ts
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDashboardData } from '../useDashboardData'

// Mock del store
vi.mock('@features/dashboard/stores/MeasurementStore', () => ({
  useMeasurementStore: vi.fn(() => ({
    measurements: [],
    loading: false,
    fetchMeasurements: vi.fn()
  }))
}))

describe('useDashboardData', () => {
  it('fetches data on mount', async () => {
    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.metrics).toBeDefined()
  })
})
```

#### Scripts de Testing Unitario

```bash
# Ejecutar tests unitarios
pnpm test:unit

# Tests en modo watch
pnpm test:unit --watch

# Cobertura de código
pnpm test:coverage

# Tests específicos
pnpm test:unit MetricCard
```

### Testing E2E con Playwright

#### Configuración de Tests

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
  },
})
```

### Ejemplo de Test E2E

```typescript
// tests/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Dashboard Page', () => {
  test('should load dashboard with metrics', async ({ page }) => {
    await page.goto('/dashboard')

    // Verificar que el dashboard carga
    await expect(page.locator('h1')).toContainText('Dashboard')

    // Verificar presencia de métricas
    await expect(page.locator('[data-testid="metrics-grid"]')).toBeVisible()

    // Verificar gráficos
    await expect(page.locator('[data-testid="water-level-chart"]')).toBeVisible()

    // Verificar navegación
    await page.click('text=Reportes')
    await expect(page).toHaveURL('/reports')
  })

  test('should export data to PDF', async ({ page }) => {
    await page.goto('/dashboard')

    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="export-pdf-button"]')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/)
  })
})
```

## 🚀 Optimización y Rendimiento

### Lazy Loading de Componentes

```typescript
// Lazy loading de componentes pesados
const HeavyChart = lazy(() => import('./HeavyChart'))

const MyComponent = () => (
  <Suspense fallback={<ChartSkeleton />}>
    <HeavyChart data={data} />
  </Suspense>
)
```

### Memoización Estratégica

```typescript
// React.memo para componentes que reciben props estables
export const StationCard = React.memo<StationCardProps>(({ station, onClick }) => {
  return (
    <Card onClick={() => onClick(station)}>
      {/* Contenido del card */}
    </Card>
  )
})

// useMemo para cálculos costosos
const processedData = useMemo(() => {
  return heavyDataProcessing(rawData)
}, [rawData])

// useCallback para funciones estables
const handleStationClick = useCallback((station: Station) => {
  selectStation(station)
  navigate(`/stations/${station.id}`)
}, [selectStation, navigate])
```

### Optimización de Bundle

```typescript
// vite.config.ts - Configuración de chunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  }
})
```

## 🔧 Herramientas de Desarrollo

### Scripts Útiles

```json
// package.json - Scripts adicionales
{
  "scripts": {
    "analyze": "vite-bundle-analyzer",
    "check-types": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "test:watch": "playwright test --ui",
    "build:analyze": "vite build && vite-bundle-analyzer"
  }
}
```

### Pre-commit Hooks

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint
pnpm check-types
pnpm test
```

## 🚀 Deploy y Producción

### Build de Producción

```bash
# Verificar tipos y build
pnpm build

# Preview local del build
pnpm preview

# Análisis del bundle
pnpm build:analyze
```

### Variables de Entorno para Producción

```env
# .env.production
VITE_API_URL=https://api.rioclaro.gov.cl
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
```

### Optimizaciones para Producción

1. **Minificación**: Automática con Vite
2. **Tree Shaking**: Eliminación de código no usado
3. **Code Splitting**: División automática de chunks
4. **Asset Optimization**: Compresión de imágenes y assets
5. **Gzip Compression**: Compresión del servidor

## 📚 Recursos y Referencias

### Documentación Oficial

- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://github.com/pmndrs/zustand)
- [Playwright](https://playwright.dev)

### Herramientas Recomendadas

- **VS Code**: Editor principal
- **React Developer Tools**: Extensión para debugging
- **TypeScript Importer**: Auto-import de tipos
- **Tailwind CSS IntelliSense**: Autocompletado de clases
- **Playwright Test**: Extensión para testing

### Comunidad y Soporte

- [GitHub Issues](https://github.com/sebitabravo/rioclaro-mokup/issues)
- [Documentación del Proyecto](./README.md)

Esta guía cubre todos los aspectos del desarrollo en el proyecto. Para más detalles específicos, consulta la documentación individual de cada tecnología.
