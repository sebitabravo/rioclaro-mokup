# 🔄 Servicio de Normalización de Datos

## 🎯 Problema que Resuelve

En el sistema de monitoreo del Río Claro, necesitamos trabajar con **múltiples fuentes de datos** que pueden tener formatos diferentes, especialmente al integrar sensores IoT, APIs gubernamentales, y datos históricos en CSV.

```typescript
// ❌ Problema: Cada fuente tiene su propio formato
const sensorIoTData = [
  { timestamp: "2025-01-13T10:00:00Z", water_level: 2.3, device_id: "RIO_001" }
];

const governmentApiData = [
  { fecha_medicion: "2025-01-13T10:00:00Z", altura_agua: 2.3, codigo_estacion: "EST_CLARO_01" }
];

const csvHistoricalData = [
  { fecha: "2025-01-13T10:00:00Z", nivel: 2.3, estacion: "Río Claro - Temuco" }
];

const mockData = [
  { time: "2025-01-13T10:00:00Z", level: 2.3, station_name: "Estación Mockup" }
];
```

**Sin normalización**, cada vez que cambias la fuente de datos o añades una nueva, tienes que:

1. ❌ Modificar todos los componentes que usan los datos
2. ❌ Cambiar la lógica de transformación en múltiples lugares  
3. ❌ Actualizar los gráficos y visualizaciones
4. ❌ Probar todo el sistema nuevamente
5. ❌ Mantener múltiples versiones de la misma lógica

**Con normalización**, solo cambias la configuración del servicio y todo funciona automáticamente.

## 🚀 Solución: DataNormalizationService

### Concepto Central

El `DataNormalizationService` actúa como una **capa de abstracción** que convierte cualquier formato de datos a un formato estándar que todos los componentes de la aplicación pueden entender.

```typescript
// ✅ Solución: Un servicio que normaliza cualquier formato
const normalized = DataNormalizationService.normalizeChartData(
  sensorIoTData, 
  DataSourceType.IOT_SENSOR
);

// Siempre obtienes el mismo formato normalizado:
{
  datasets: [{
    data: [
      {
        timestamp: "2025-01-13T10:00:00Z",
        value: 2.3,
        label: "RIO_001",
        station: "RIO_001",
        unit: "metros"
      }
    ],
    label: "Nivel de Agua",
    color: "#3b82f6"
  }],
  metadata: {
    source: "IOT_SENSOR",
    totalPoints: 1,
    dateRange: {
      start: "2025-01-13T10:00:00Z",
      end: "2025-01-13T10:00:00Z"
    }
  }
}
```

## 📊 Implementación Actual

### Tipos de Datos Soportados

```typescript
// src/shared/services/DataNormalizationService.ts
export enum DataSourceType {
  IOT_SENSOR = 'iot_sensor',
  GOVERNMENT_API = 'government_api',
  CSV_HISTORICAL = 'csv_historical',
  MOCK_DATA = 'mock_data',
  API_V1 = 'api_v1',
  API_V2 = 'api_v2'
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  station?: string;
  unit?: string;
  quality?: 'good' | 'fair' | 'poor';
  is_critical?: boolean;
}

export interface ChartDataSet {
  datasets: Array<{
    data: ChartDataPoint[];
    label: string;
    color: string;
    unit?: string;
  }>;
  metadata: {
    source: DataSourceType;
    totalPoints: number;
    dateRange: {
      start: string;
      end: string;
    };
    stations?: string[];
  };
}
```

### Servicio Principal

```typescript
export class DataNormalizationService {
  /**
   * Normaliza datos de cualquier fuente a formato estándar para gráficos
   */
  static normalizeChartData(
    data: any[], 
    sourceType: DataSourceType
  ): ChartDataSet {
    const normalizedPoints = this.transformDataPoints(data, sourceType);
    
    return {
      datasets: [{
        data: normalizedPoints,
        label: this.getDatasetLabel(sourceType),
        color: this.getDatasetColor(sourceType),
        unit: this.getDatasetUnit(sourceType)
      }],
      metadata: this.generateMetadata(normalizedPoints, sourceType)
    };
  }

  /**
   * Transforma mediciones del dominio a puntos de gráfico
   */
  static transformMeasurements(measurements: Measurement[]): ChartDataPoint[] {
    return measurements.map(measurement => ({
      timestamp: measurement.timestamp,
      value: measurement.value,
      label: measurement.station_name || `Estación ${measurement.station_id}`,
      station: measurement.station_name,
      unit: measurement.unit,
      quality: measurement.quality,
      is_critical: measurement.is_critical
    }));
  }

  /**
   * Normaliza datos de estaciones para mapas
   */
  static normalizeStationData(stations: any[], sourceType: DataSourceType): Station[] {
    return stations.map(station => this.transformStationData(station, sourceType));
  }

  private static transformDataPoints(data: any[], sourceType: DataSourceType): ChartDataPoint[] {
    switch (sourceType) {
      case DataSourceType.IOT_SENSOR:
        return data.map(item => ({
          timestamp: item.timestamp,
          value: item.water_level,
          label: item.device_id,
          station: item.device_id,
          unit: 'metros'
        }));

      case DataSourceType.GOVERNMENT_API:
        return data.map(item => ({
          timestamp: item.fecha_medicion,
          value: item.altura_agua,
          label: item.codigo_estacion,
          station: item.codigo_estacion,
          unit: 'metros'
        }));

      case DataSourceType.CSV_HISTORICAL:
        return data.map(item => ({
          timestamp: item.fecha,
          value: item.nivel,
          label: item.estacion,
          station: item.estacion,
          unit: 'metros'
        }));

      case DataSourceType.MOCK_DATA:
        return data.map(item => ({
          timestamp: item.time || item.timestamp,
          value: item.level || item.value,
          label: item.station_name || item.label,
          station: item.station_name,
          unit: 'metros'
        }));

      default:
        throw new Error(`Tipo de fuente no soportado: ${sourceType}`);
    }
  }

  private static transformStationData(station: any, sourceType: DataSourceType): Station {
    const baseStation = {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    switch (sourceType) {
      case DataSourceType.IOT_SENSOR:
        return {
          ...baseStation,
          id: station.device_id,
          name: station.device_name || `Sensor ${station.device_id}`,
          code: station.device_id,
          location: station.location || 'Río Claro',
          latitude: station.lat,
          longitude: station.lng,
          current_level: station.current_water_level,
          threshold: station.alert_threshold || 3.0,
          status: station.active ? 'active' : 'inactive',
          last_measurement: station.last_reading
        };

      case DataSourceType.GOVERNMENT_API:
        return {
          ...baseStation,
          id: station.id_estacion,
          name: station.nombre_estacion,
          code: station.codigo_estacion,
          location: station.ubicacion,
          latitude: station.latitud,
          longitude: station.longitud,
          current_level: station.nivel_actual,
          threshold: station.umbral_alerta,
          status: station.estado === 'activa' ? 'active' : 'inactive',
          last_measurement: station.ultima_medicion
        };

      default:
        return {
          ...baseStation,
          id: station.id,
          name: station.name,
          code: station.code,
          location: station.location,
          latitude: station.latitude,
          longitude: station.longitude,
          current_level: station.current_level,
          threshold: station.threshold,
          status: station.status,
          last_measurement: station.last_measurement
        };
    }
  }

  private static getDatasetLabel(sourceType: DataSourceType): string {
    const labels = {
      [DataSourceType.IOT_SENSOR]: 'Sensores IoT',
      [DataSourceType.GOVERNMENT_API]: 'API Gubernamental',
      [DataSourceType.CSV_HISTORICAL]: 'Datos Históricos',
      [DataSourceType.MOCK_DATA]: 'Datos de Prueba'
    };
    return labels[sourceType] || 'Nivel de Agua';
  }

  private static getDatasetColor(sourceType: DataSourceType): string {
    const colors = {
      [DataSourceType.IOT_SENSOR]: '#10b981',      // Verde
      [DataSourceType.GOVERNMENT_API]: '#3b82f6',   // Azul
      [DataSourceType.CSV_HISTORICAL]: '#f59e0b',   // Amarillo
      [DataSourceType.MOCK_DATA]: '#8b5cf6'         // Púrpura
    };
    return colors[sourceType] || '#6b7280';
  }

  private static getDatasetUnit(sourceType: DataSourceType): string {
    // Todos los tipos de datos del río usan metros
    return 'metros';
  }

  private static generateMetadata(
    data: ChartDataPoint[], 
    sourceType: DataSourceType
  ): ChartDataSet['metadata'] {
    const timestamps = data.map(point => point.timestamp).sort();
    const stations = [...new Set(data.map(point => point.station).filter(Boolean))];

    return {
      source: sourceType,
      totalPoints: data.length,
      dateRange: {
        start: timestamps[0] || '',
        end: timestamps[timestamps.length - 1] || ''
      },
      stations
    };
  }
}
```

## 🎨 Uso en Componentes

### En Gráficos (Recharts)

```typescript
// src/presentation/components/charts/NormalizedChart.tsx
import { DataNormalizationService, DataSourceType } from '@shared/services/DataNormalizationService'

interface NormalizedChartProps {
  rawData: any[];
  sourceType: DataSourceType;
  height?: number;
}

export const NormalizedChart: React.FC<NormalizedChartProps> = ({ 
  rawData, 
  sourceType, 
  height = 300 
}) => {
  const chartData = useMemo(() => {
    return DataNormalizationService.normalizeChartData(rawData, sourceType);
  }, [rawData, sourceType]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          {chartData.datasets[0]?.label || 'Datos Normalizados'}
        </h3>
        <p className="text-sm text-muted-foreground">
          Fuente: {chartData.metadata.source} | 
          Puntos: {chartData.metadata.totalPoints} |
          Estaciones: {chartData.metadata.stations?.length || 0}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData.datasets[0]?.data || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis 
            label={{ 
              value: chartData.datasets[0]?.unit || 'Valor', 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          <Tooltip 
            formatter={(value) => [`${value} ${chartData.datasets[0]?.unit}`, chartData.datasets[0]?.label]}
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={chartData.datasets[0]?.color || '#3b82f6'}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

### En Páginas con Múltiples Fuentes

```typescript
// src/presentation/pages/DashboardPage.tsx
export const DashboardPage: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataSourceType>(DataSourceType.MOCK_DATA);
  const [rawData, setRawData] = useState<any[]>([]);

  const handleSourceChange = async (newSource: DataSourceType) => {
    setDataSource(newSource);
    
    // Cambiar la fuente de datos sin modificar componentes
    switch (newSource) {
      case DataSourceType.IOT_SENSOR:
        setRawData(await fetchIoTSensorData());
        break;
      case DataSourceType.GOVERNMENT_API:
        setRawData(await fetchGovernmentData());
        break;
      case DataSourceType.CSV_HISTORICAL:
        setRawData(await fetchHistoricalData());
        break;
      default:
        setRawData(generateMockData());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <label>Fuente de Datos:</label>
        <select 
          value={dataSource} 
          onChange={(e) => handleSourceChange(e.target.value as DataSourceType)}
        >
          <option value={DataSourceType.MOCK_DATA}>Datos de Prueba</option>
          <option value={DataSourceType.IOT_SENSOR}>Sensores IoT</option>
          <option value={DataSourceType.GOVERNMENT_API}>API Gubernamental</option>
          <option value={DataSourceType.CSV_HISTORICAL}>Datos Históricos</option>
        </select>
      </div>

      {/* Los componentes no cambian, solo los datos */}
      <NormalizedChart 
        rawData={rawData} 
        sourceType={dataSource} 
      />
      
      <MetricsDashboard 
        rawData={rawData} 
        sourceType={dataSource} 
      />
    </div>
  );
};
```

## 🔧 Configuración Avanzada

### Personalización de Transformaciones

```typescript
// Configuración personalizada para diferentes proyectos
export interface NormalizationConfig {
  fieldMappings: Record<string, string>;
  defaultValues: Record<string, any>;
  validators: Record<string, (value: any) => boolean>;
  formatters: Record<string, (value: any) => any>;
}

export class ConfigurableDataNormalizer {
  constructor(private config: NormalizationConfig) {}

  normalize(data: any[], sourceType: DataSourceType): ChartDataSet {
    const mappings = this.config.fieldMappings[sourceType] || {};
    
    const transformedData = data.map(item => {
      const normalizedItem: ChartDataPoint = {
        timestamp: this.getFieldValue(item, mappings.timestamp || 'timestamp'),
        value: this.getFieldValue(item, mappings.value || 'value'),
        label: this.getFieldValue(item, mappings.label || 'label'),
        station: this.getFieldValue(item, mappings.station || 'station'),
        unit: this.getFieldValue(item, mappings.unit || 'unit') || 'metros'
      };

      return this.applyValidations(normalizedItem);
    });

    return this.buildChartDataSet(transformedData, sourceType);
  }

  private getFieldValue(item: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], item);
  }

  private applyValidations(item: ChartDataPoint): ChartDataPoint {
    // Aplicar validaciones configurables
    if (this.config.validators.timestamp && !this.config.validators.timestamp(item.timestamp)) {
      item.timestamp = new Date().toISOString();
    }

    if (this.config.validators.value && !this.config.validators.value(item.value)) {
      item.value = 0;
    }

    return item;
  }
}
```

### Testing del Servicio

```typescript
// tests/data-normalization.spec.ts
import { test, expect } from '@playwright/test';
import { DataNormalizationService, DataSourceType } from '../src/shared/services/DataNormalizationService';

test.describe('DataNormalizationService', () => {
  test('should normalize IoT sensor data correctly', () => {
    const iotData = [
      {
        timestamp: '2025-01-13T10:00:00Z',
        water_level: 2.5,
        device_id: 'RIO_001'
      }
    ];

    const normalized = DataNormalizationService.normalizeChartData(
      iotData, 
      DataSourceType.IOT_SENSOR
    );

    expect(normalized.datasets[0].data[0]).toEqual(
      expect.objectContaining({
        timestamp: '2025-01-13T10:00:00Z',
        value: 2.5,
        label: 'RIO_001',
        station: 'RIO_001',
        unit: 'metros'
      })
    );
  });

  test('should handle multiple data sources', () => {
    const sources = [
      DataSourceType.IOT_SENSOR,
      DataSourceType.GOVERNMENT_API,
      DataSourceType.CSV_HISTORICAL,
      DataSourceType.MOCK_DATA
    ];

    sources.forEach(sourceType => {
      const mockData = generateMockDataForSource(sourceType);
      const normalized = DataNormalizationService.normalizeChartData(mockData, sourceType);
      
      expect(normalized.datasets).toHaveLength(1);
      expect(normalized.metadata.source).toBe(sourceType);
      expect(normalized.datasets[0].data.length).toBeGreaterThan(0);
    });
  });
});
```

## 🌟 Beneficios del Sistema

### 1. **Flexibilidad de Fuentes de Datos**
```typescript
// Cambiar de datos de prueba a producción en una línea
- const data = DataNormalizationService.normalizeChartData(mockData, DataSourceType.MOCK_DATA);
+ const data = DataNormalizationService.normalizeChartData(productionData, DataSourceType.IOT_SENSOR);
```

### 2. **Mantenibilidad**
- Un solo lugar para modificar lógica de transformación
- Componentes desacoplados de la estructura de datos
- Testing más sencillo con datos predecibles

### 3. **Escalabilidad**
- Agregar nuevos tipos de datos sin romper código existente
- Reutilización de componentes entre diferentes proyectos
- Configuración por ambiente (dev/staging/prod)

### 4. **Consistencia**
- Todos los gráficos usan el mismo formato de datos
- Validaciones centralizadas
- Metadata estándar para todas las fuentes

## 🚀 Casos de Uso Reales

### Integración con API Gubernamental

```typescript
// Cuando se conecte a la API real del gobierno
const governmentData = await fetch('https://api.dga.cl/stations/water-levels')
  .then(res => res.json());

// Solo cambiar el tipo de fuente, los componentes siguen igual
const chartData = DataNormalizationService.normalizeChartData(
  governmentData, 
  DataSourceType.GOVERNMENT_API
);
```

### Migración de Datos Legacy

```typescript
// Datos antiguos en CSV
const csvData = await parseCsvFile('historical-data.csv');

// Integración sin modificar UI
const normalizedData = DataNormalizationService.normalizeChartData(
  csvData, 
  DataSourceType.CSV_HISTORICAL
);
```

### A/B Testing de Fuentes

```typescript
// Testing de diferentes fuentes sin duplicar código
const dataSource = isExperimentGroup 
  ? DataSourceType.IOT_SENSOR 
  : DataSourceType.GOVERNMENT_API;

const data = DataNormalizationService.normalizeChartData(rawData, dataSource);
```

## 🔮 Futuras Mejoras

### 1. **Normalización Automática por ML**
```typescript
// Detectar automáticamente el formato de datos
const detectedType = DataNormalizationService.detectSourceType(unknownData);
const normalized = DataNormalizationService.normalizeChartData(unknownData, detectedType);
```

### 2. **Cache y Optimización**
```typescript
// Cache de transformaciones costosas
const cached = DataNormalizationService.normalizeWithCache(data, sourceType);
```

### 3. **Validación de Esquemas**
```typescript
// Validación automática con Zod
const schema = DataNormalizationService.getSchemaForSource(sourceType);
const validatedData = schema.parse(rawData);
```

Este servicio es fundamental para mantener la flexibilidad y escalabilidad del sistema de monitoreo del Río Claro, permitiendo adaptarse a diferentes fuentes de datos sin impacto en la experiencia del usuario.