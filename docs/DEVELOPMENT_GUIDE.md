# 🛠️ Guía de Desarrollo

## 🚀 Configuración Inicial

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git**
- Editor de código (VS Code recomendado)

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd sistema-monitoreo-rio-claro-vite

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Ejecutar en desarrollo
npm run dev
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (http://localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
npm run lint:fix     # Fix automático de problemas de lint
npm run type-check   # Verificación de tipos TypeScript
```

## ⚙️ Configuración del Entorno

### Variables de Entorno

Crear archivo `.env.local`:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Map Configuration
VITE_MAP_CENTER_LAT=-36.7
VITE_MAP_CENTER_LNG=-72.1
VITE_MAP_ZOOM=10

# Environment
VITE_APP_ENV=development
```

### Configuración de VS Code

Archivo `.vscode/settings.json` recomendado:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Extensiones Recomendadas

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 📁 Convenciones de Código

### Nomenclatura

```typescript
// ✅ Componentes: PascalCase
export function StationCard() {}

// ✅ Variables y funciones: camelCase
const currentLevel = 2.3;
const formatWaterLevel = (level: number) => {};

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8000";

// ✅ Tipos e interfaces: PascalCase
interface Station {}
type AlertStatus = 'active' | 'resolved';

// ✅ Archivos de componentes: PascalCase
StationCard.tsx
DashboardPage.tsx

// ✅ Archivos de utilidades: camelCase
formatters.ts
apiClient.ts
```

### Estructura de Archivos

```typescript
// ✅ Imports ordenados
import { useEffect, useState } from "react";           // React primero
import { Button } from "@presentation/components/ui";  // Componentes UI
import { useStationStore } from "@presentation/stores"; // Stores
import { formatWaterLevel } from "@shared/utils";     // Utilidades
import type { Station } from "@domain/entities";      // Tipos al final

// ✅ Estructura del componente
export function ComponentName() {
  // 1. Estado y hooks
  const [loading, setLoading] = useState(false);
  const { stations, fetchStations } = useStationStore();

  // 2. Efectos
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // 3. Handlers
  const handleRefresh = async () => {
    setLoading(true);
    await fetchStations();
    setLoading(false);
  };

  // 4. Render helpers (si son complejos)
  const renderStationCard = (station: Station) => (
    <div key={station.id}>{station.name}</div>
  );

  // 5. Return principal
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Imports con Path Aliases

```typescript
// ✅ Usar aliases definidos
import { Station } from "@domain/entities/Station";
import { GetStationsUseCase } from "@application/use-cases/station/GetStationsUseCase";
import { MockStationRepository } from "@infrastructure/adapters/MockStationRepository";
import { Button } from "@presentation/components/ui/button";
import { formatWaterLevel } from "@shared/utils/formatters";

// ❌ NO usar imports relativos largos
import { Station } from "../../../../domain/entities/Station";
```

## 🏗️ Patrones de Desarrollo

### 1. Crear Nueva Entidad

#### Paso 1: Definir entidad en Domain

```typescript
// src/domain/entities/NewEntity.ts
export interface NewEntity {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface NewEntityFilters {
  name?: string;
  date_from?: string;
  date_to?: string;
}
```

#### Paso 2: Crear repositorio (contrato)

```typescript
// src/domain/repositories/NewEntityRepository.ts
import type { NewEntity, NewEntityFilters } from "@domain/entities/NewEntity";

export interface NewEntityRepository {
  getAll(filters?: NewEntityFilters): Promise<NewEntity[]>;
  getById(id: number): Promise<NewEntity>;
  create(entity: Omit<NewEntity, 'id' | 'created_at' | 'updated_at'>): Promise<NewEntity>;
  update(id: number, entity: Partial<NewEntity>): Promise<NewEntity>;
  delete(id: number): Promise<void>;
}
```

#### Paso 3: Implementar use cases

```typescript
// src/application/use-cases/new-entity/GetNewEntitiesUseCase.ts
import type { NewEntity } from "@domain/entities/NewEntity";
import type { NewEntityRepository } from "@domain/repositories/NewEntityRepository";

export class GetNewEntitiesUseCase {
  constructor(private newEntityRepository: NewEntityRepository) {}

  async execute(): Promise<NewEntity[]> {
    try {
      const entities = await this.newEntityRepository.getAll();
      return entities.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      throw new Error(`Error al obtener entidades: ${error.message}`);
    }
  }
}
```

#### Paso 4: Crear repositorio mock

```typescript
// src/infrastructure/adapters/MockNewEntityRepository.ts
import type { NewEntity, NewEntityFilters } from "@domain/entities/NewEntity";
import type { NewEntityRepository } from "@domain/repositories/NewEntityRepository";

export class MockNewEntityRepository implements NewEntityRepository {
  private entities: NewEntity[] = [
    {
      id: 1,
      name: "Entidad de ejemplo",
      created_at: "2025-01-13T10:00:00Z",
      updated_at: "2025-01-13T10:00:00Z"
    }
  ];

  async getAll(filters?: NewEntityFilters): Promise<NewEntity[]> {
    let filtered = [...this.entities];
    
    if (filters?.name) {
      filtered = filtered.filter(e => 
        e.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    
    return Promise.resolve(filtered);
  }

  async getById(id: number): Promise<NewEntity> {
    const entity = this.entities.find(e => e.id === id);
    if (!entity) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }
    return Promise.resolve(entity);
  }

  async create(data: Omit<NewEntity, 'id' | 'created_at' | 'updated_at'>): Promise<NewEntity> {
    const newEntity: NewEntity = {
      ...data,
      id: Math.max(...this.entities.map(e => e.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.entities.push(newEntity);
    return Promise.resolve(newEntity);
  }

  async update(id: number, data: Partial<NewEntity>): Promise<NewEntity> {
    const index = this.entities.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }

    this.entities[index] = {
      ...this.entities[index],
      ...data,
      updated_at: new Date().toISOString()
    };

    return Promise.resolve(this.entities[index]);
  }

  async delete(id: number): Promise<void> {
    const index = this.entities.findIndex(e => e.id === id);
    if (index === -1) {
      throw new Error(`Entidad con ID ${id} no encontrada`);
    }

    this.entities.splice(index, 1);
  }
}
```

#### Paso 5: Registrar en DI Container

```typescript
// src/infrastructure/di/Container.ts
import { GetNewEntitiesUseCase } from "@application/use-cases/new-entity/GetNewEntitiesUseCase";
import { MockNewEntityRepository } from "@infrastructure/adapters/MockNewEntityRepository";

export class DIContainer {
  // ... otros repositorios
  private _newEntityRepository!: NewEntityRepository;
  
  // ... otros use cases
  public getNewEntitiesUseCase!: GetNewEntitiesUseCase;

  private initializeRepositories(): void {
    // ... otros repositorios
    this._newEntityRepository = new MockNewEntityRepository();
  }

  private initializeUseCases(): void {
    // ... otros use cases
    this.getNewEntitiesUseCase = new GetNewEntitiesUseCase(this._newEntityRepository);
  }
}
```

#### Paso 6: Crear store

```typescript
// src/presentation/stores/NewEntityStore.ts
import { create } from 'zustand';
import type { NewEntity } from '@domain/entities/NewEntity';
import { DIContainer } from '@infrastructure/di/Container';

interface NewEntityState {
  entities: NewEntity[];
  loading: boolean;
  error: string | null;
  selectedEntity: NewEntity | null;
  
  // Actions
  fetchEntities: () => Promise<void>;
  fetchEntityById: (id: number) => Promise<void>;
  createEntity: (data: Omit<NewEntity, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEntity: (id: number, data: Partial<NewEntity>) => Promise<void>;
  deleteEntity: (id: number) => Promise<void>;
  setSelectedEntity: (entity: NewEntity | null) => void;
  clearError: () => void;
}

export const useNewEntityStore = create<NewEntityState>((set, get) => ({
  entities: [],
  loading: false,
  error: null,
  selectedEntity: null,

  fetchEntities: async () => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const entities = await container.getNewEntitiesUseCase.execute();
      set({ entities, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar entidades',
        loading: false 
      });
    }
  },

  fetchEntityById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const entity = await container.getNewEntityByIdUseCase.execute(id);
      set({ selectedEntity: entity, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar entidad',
        loading: false 
      });
    }
  },

  createEntity: async (data) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      await container.createNewEntityUseCase.execute(data);
      await get().fetchEntities(); // Recargar lista
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear entidad',
        loading: false 
      });
    }
  },

  updateEntity: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      await container.updateNewEntityUseCase.execute(id, data);
      await get().fetchEntities(); // Recargar lista
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar entidad',
        loading: false 
      });
    }
  },

  deleteEntity: async (id) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      await container.deleteNewEntityUseCase.execute(id);
      await get().fetchEntities(); // Recargar lista
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar entidad',
        loading: false 
      });
    }
  },

  setSelectedEntity: (entity) => {
    set({ selectedEntity: entity });
  },

  clearError: () => {
    set({ error: null });
  },
}));
```

#### Paso 7: Crear página

```typescript
// src/presentation/pages/NewEntityPage.tsx
import { useEffect } from "react";
import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { useNewEntityStore } from "@presentation/stores/NewEntityStore";

export function NewEntityPage() {
  const { entities, loading, error, fetchEntities } = useNewEntityStore();

  useEffect(() => {
    fetchEntities();
  }, [fetchEntities]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gov-neutral">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gov-neutral">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gov-black">Nueva Entidad</h1>
          <p className="text-lg text-gov-gray-a">Gestión de entidades del sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <Card key={entity.id} className="bg-gov-white border-gov-accent">
              <CardHeader>
                <CardTitle className="text-gov-black">{entity.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gov-gray-b">ID: {entity.id}</p>
                <p className="text-sm text-gov-gray-b">
                  Creado: {new Date(entity.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
```

#### Paso 8: Agregar ruta

```typescript
// src/App.tsx
import { NewEntityPage } from "@presentation/pages/NewEntityPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* ... rutas existentes */}
        <Route path="/new-entity" element={<NewEntityPage />} />
      </Routes>
    </Router>
  );
}
```

### 2. Crear Nuevo Componente UI

```typescript
// src/presentation/components/ui/new-component.tsx
import { ReactNode } from "react";
import { cn } from "@shared/utils/cn";

interface NewComponentProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NewComponent({ 
  children, 
  variant = 'default', 
  size = 'md',
  className 
}: NewComponentProps) {
  return (
    <div 
      className={cn(
        // Base styles
        "inline-flex items-center justify-center rounded-md",
        
        // Variant styles
        {
          'bg-gov-primary text-white': variant === 'default',
          'bg-gov-secondary text-white': variant === 'secondary',
          'border border-gov-accent bg-transparent': variant === 'outline',
        },
        
        // Size styles
        {
          'text-sm px-3 py-2': size === 'sm',
          'text-base px-4 py-2': size === 'md',
          'text-lg px-6 py-3': size === 'lg',
        },
        
        className
      )}
    >
      {children}
    </div>
  );
}
```

### 3. Integrar Nueva Fuente de Datos

```typescript
// 1. Agregar tipo al enum
export enum DataSourceType {
  // ... tipos existentes
  NEW_API = 'new_api'
}

// 2. Implementar normalización
private static normalizeNewApi(data: any[]): ChartDataSet {
  const normalizedData = data.map(item => ({
    timestamp: item.your_timestamp_field,
    value: parseFloat(item.your_value_field || 0),
    label: item.your_label_field || 'Sin etiqueta',
    station: item.your_station_field?.toString()
  }));

  return {
    data: normalizedData,
    metadata: {
      type: 'new_api',
      source: 'new_api_source',
      unit: 'm',
      range: this.calculateRange(normalizedData.map(d => d.value))
    }
  };
}

// 3. Usar en componentes
<NormalizedChart 
  rawData={newApiData}
  sourceType={DataSourceType.NEW_API}
/>
```

## 🧪 Testing

### Configuración de Tests

```bash
# Instalar dependencias de testing
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest jsdom
```

### Ejemplo de Test de Use Case

```typescript
// src/application/use-cases/__tests__/GetStationsUseCase.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { GetStationsUseCase } from '../station/GetStationsUseCase';
import { MockStationRepository } from '@infrastructure/adapters/MockStationRepository';

describe('GetStationsUseCase', () => {
  let useCase: GetStationsUseCase;
  let mockRepository: MockStationRepository;

  beforeEach(() => {
    mockRepository = new MockStationRepository();
    useCase = new GetStationsUseCase(mockRepository);
  });

  it('should return sorted stations', async () => {
    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Río Claro Centro');
    expect(result[1].name).toBe('Río Claro Norte');
    expect(result[2].name).toBe('Río Claro Sur');
  });

  it('should handle repository errors', async () => {
    // Arrange
    const errorMessage = 'Database connection failed';
    vi.spyOn(mockRepository, 'getAll').mockRejectedValue(new Error(errorMessage));

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow('Error al obtener estaciones: Database connection failed');
  });
});
```

### Ejemplo de Test de Componente

```typescript
// src/presentation/components/__tests__/StationCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StationCard } from '../StationCard';
import type { Station } from '@domain/entities/Station';

const mockStation: Station = {
  id: 1,
  name: 'Test Station',
  code: 'TS-001',
  location: 'Test Location',
  latitude: -36.7,
  longitude: -72.1,
  current_level: 2.3,
  threshold: 3.0,
  status: 'active',
  last_measurement: '2025-01-13T10:00:00Z',
  created_at: '2025-01-10T00:00:00Z',
  updated_at: '2025-01-13T10:00:00Z'
};

describe('StationCard', () => {
  it('should render station information', () => {
    render(<StationCard station={mockStation} />);

    expect(screen.getByText('Test Station')).toBeInTheDocument();
    expect(screen.getByText('TS-001')).toBeInTheDocument();
    expect(screen.getByText('Test Location')).toBeInTheDocument();
    expect(screen.getByText('2.30m')).toBeInTheDocument();
  });

  it('should show critical status when level exceeds threshold', () => {
    const criticalStation = { ...mockStation, current_level: 3.5 };
    render(<StationCard station={criticalStation} />);

    expect(screen.getByText('¡Nivel Crítico!')).toBeInTheDocument();
  });
});
```

### Ejemplo de Test de Normalización

```typescript
// src/shared/services/__tests__/DataNormalizationService.test.ts
import { describe, it, expect } from 'vitest';
import { DataNormalizationService, DataSourceType } from '../DataNormalizationService';

describe('DataNormalizationService', () => {
  it('should normalize measurement data correctly', () => {
    // Arrange
    const rawData = [
      {
        timestamp: '2025-01-13T10:00:00Z',
        value: 2.3,
        station_name: 'Test Station'
      }
    ];

    // Act
    const result = DataNormalizationService.normalize(rawData, DataSourceType.MEASUREMENT);

    // Assert
    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toMatchObject({
      timestamp: '2025-01-13T10:00:00Z',
      value: 2.3,
      label: 'Test Station'
    });
    expect(result.metadata.type).toBe('measurement');
    expect(result.metadata.unit).toBe('m');
  });

  it('should handle different source types', () => {
    const apiV1Data = [{ time: '2025-01-13T10:00:00Z', level: 2.1, sensor_id: 'A1' }];
    const result = DataNormalizationService.normalize(apiV1Data, DataSourceType.API_V1);

    expect(result.data[0].timestamp).toBe('2025-01-13T10:00:00Z');
    expect(result.data[0].value).toBe(2.1);
    expect(result.metadata.type).toBe('api_v1');
  });
});
```

## 🎨 Estilos y UI

### Sistema de Colores

```css
/* Variables CSS personalizadas */
:root {
  --gov-primary: #2563eb;      /* Azul principal */
  --gov-secondary: #dc2626;    /* Rojo alertas */
  --gov-green: #16a34a;        /* Verde éxito */
  --gov-orange: #ea580c;       /* Naranja advertencia */
  --gov-neutral: #f8fafc;      /* Fondo neutral */
  --gov-white: #ffffff;        /* Blanco */
  --gov-black: #0f172a;        /* Negro texto */
  --gov-gray-a: #64748b;       /* Gris texto secundario */
  --gov-gray-b: #94a3b8;       /* Gris texto terciario */
  --gov-accent: #e2e8f0;       /* Gris bordes */
}
```

### Uso de Tailwind CSS

```typescript
// ✅ Usar variables CSS para colores del gobierno
<div className="bg-gov-primary text-white">

// ✅ Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ✅ Espaciado consistente
<div className="p-4 md:p-6 lg:p-8">

// ✅ Typography
<h1 className="text-2xl md:text-3xl font-bold text-gov-black">
```

### Componentes UI Base

```typescript
// ✅ Usar componentes base consistentes
import { Button } from "@presentation/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Input } from "@presentation/components/ui/input";

// ✅ Props consistentes
<Button variant="outline" size="sm" className="w-full md:w-auto">
<Card className="bg-gov-white border-gov-accent">
```

## 🚨 Manejo de Errores

### Patrones de Error Handling

```typescript
// ✅ En Use Cases
export class GetStationsUseCase {
  async execute(): Promise<Station[]> {
    try {
      const stations = await this.stationRepository.getAll();
      return stations;
    } catch (error) {
      // Log del error real para debugging
      console.error('Error en GetStationsUseCase:', error);
      
      // Throw error user-friendly
      throw new Error(`Error al obtener estaciones: ${error.message}`);
    }
  }
}

// ✅ En Stores
export const useStationStore = create<StationState>((set) => ({
  fetchStations: async () => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const stations = await container.getStationsUseCase.execute();
      set({ stations, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false 
      });
    }
  },
}));

// ✅ En Componentes
function StationsPage() {
  const { stations, loading, error, fetchStations, clearError } = useStationStore();

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => { clearError(); fetchStations(); }}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      {/* Contenido normal */}
    </div>
  );
}
```

## 📝 Documentación de Código

### JSDoc para funciones complejas

```typescript
/**
 * Normaliza datos de diferentes fuentes para uso en gráficos
 * @param rawData - Datos sin procesar de cualquier fuente
 * @param sourceType - Tipo de fuente de datos según DataSourceType
 * @returns Objeto con datos normalizados y metadata
 * @throws Error si el tipo de fuente no es soportado
 * 
 * @example
 * ```typescript
 * const normalized = DataNormalizationService.normalize(
 *   csvData, 
 *   DataSourceType.CSV
 * );
 * ```
 */
static normalize(rawData: any[], sourceType: DataSourceType): ChartDataSet {
  // implementación
}
```

### Comentarios en código complejo

```typescript
// Calcular estadísticas del dashboard
const stats = {
  total_stations: stations.length,
  active_stations: stations.filter((s) => s.status === "active").length,
  // Promedio de nivel de agua de todas las estaciones activas
  average_level: stations.length > 0 
    ? stations.reduce((sum, s) => sum + s.current_level, 0) / stations.length 
    : 0,
  // Estaciones que superan el umbral crítico
  critical_stations: stations.filter((s) => s.current_level > s.threshold).length,
};
```

## 🔧 Debugging

### Herramientas de Debug

```typescript
// ✅ React DevTools
// ✅ Redux DevTools (para Zustand)
// ✅ Console logs estratégicos

// Debug de stores
export const useStationStore = create<StationState>()(
  devtools(
    (set) => ({
      // ... store implementation
    }),
    {
      name: 'station-store', // Nombre en DevTools
    }
  )
);

// Debug de componentes
function ComponentName() {
  console.log('ComponentName render:', { props, state });
  
  useEffect(() => {
    console.log('ComponentName mounted');
    return () => console.log('ComponentName unmounted');
  }, []);
}
```

### Logging en Producción

```typescript
// src/shared/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    
    // En producción: enviar a servicio de logging
    if (process.env.NODE_ENV === 'production') {
      // Sentry, LogRocket, etc.
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

## 🚀 Performance

### Optimizaciones

```typescript
// ✅ Lazy loading de páginas
const DashboardPage = lazy(() => import('@presentation/pages/DashboardPage'));
const StationsPage = lazy(() => import('@presentation/pages/StationsPage'));

// ✅ Memoización de componentes pesados
const MemoizedChart = memo(NormalizedChart);

// ✅ useMemo para cálculos costosos
const stats = useMemo(() => {
  return {
    total_stations: stations.length,
    active_stations: stations.filter(s => s.status === 'active').length,
    // ... más cálculos
  };
}, [stations]);

// ✅ useCallback para funciones en dependencies
const handleRefresh = useCallback(async () => {
  await fetchStations();
}, [fetchStations]);
```

### Bundle Analysis

```bash
# Analizar el bundle
npm run build
npx vite-bundle-analyzer dist
```

## 📚 Recursos Adicionales

### Enlaces Útiles

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)

### Herramientas Recomendadas

- **Extensiones VS Code**: ES7+ React/Redux/React-Native snippets
- **Chrome DevTools**: React Developer Tools
- **Testing**: Vitest + Testing Library
- **Debugging**: React DevTools, Redux DevTools

Esta guía te ayudará a mantener consistencia y calidad en el desarrollo del proyecto. ¡Sigue estos patrones y tendrás un código limpio y mantenible! 🚀