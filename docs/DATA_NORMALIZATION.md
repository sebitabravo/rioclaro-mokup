# 🔄 Servicio de Normalización de Datos

## 🎯 Problema que Resuelve

En aplicaciones reales, frecuentemente necesitas trabajar con **múltiples fuentes de datos** que tienen formatos diferentes:

```typescript
// ❌ Problema: Cada fuente tiene su propio formato
const apiV1Data = [
  { time: "2025-01-13T10:00:00Z", level: 2.3, sensor_id: "A1" }
];

const apiV2Data = [
  { datetime: "2025-01-13T10:00:00Z", water_height: 2.3, device_id: "B2" }
];

const csvData = [
  { fecha: "2025-01-13T10:00:00Z", nivel: 2.3, estacion: "CSV1" }
];
```

**Sin normalización**, cada vez que cambias la fuente de datos, tienes que:
1. ✅ Modificar todos los componentes que usan los datos
2. ✅ Cambiar la lógica de transformación en múltiples lugares
3. ✅ Actualizar los gráficos y visualizaciones
4. ✅ Probar todo el sistema nuevamente

**Con normalización**, solo cambias una línea de código y todo funciona automáticamente.

## 🚀 Solución: DataNormalizationService

### Concepto Central

```typescript
// ✅ Solución: Un servicio que normaliza cualquier formato
const normalized = DataNormalizationService.normalize(
  anyFormatData, 
  DataSourceType.API_V1
);

// Siempre obtienes el mismo formato normalizado:
{
  data: [
    {
      timestamp: "2025-01-13T10:00:00Z",
      value: 2.3,
      label: "Sensor A1",
      station: "A1"
    }
  ],
  metadata: {
    type: "api_v1",
    source: "external_api_v1",
    unit: "m",
    range: { min: 2.1, max: 2.5 }
  }
}
```

## 📋 Tipos de Fuentes Soportadas

### Enum DataSourceType

```typescript
export enum DataSourceType {
  MEASUREMENT = 'measurement',    // Mediciones internas del sistema
  STATION = 'station',           // Datos de estaciones
  ALERT = 'alert',               // Datos de alertas
  REPORT = 'report',             // Datos de reportes
  API_V1 = 'api_v1',             // API externa versión 1
  API_V2 = 'api_v2',             // API externa versión 2
  CSV = 'csv',                   // Importación desde CSV
  JSON = 'json'                  // Datos JSON genéricos
}
```

### Ejemplos de Cada Tipo

#### 1. MEASUREMENT - Mediciones internas
```typescript
const measurementData = [
  {
    timestamp: "2025-01-13T10:00:00Z",
    value: 2.3,
    station_name: "Río Claro Sur",
    station_id: 1
  }
];

DataNormalizationService.normalize(measurementData, DataSourceType.MEASUREMENT);
```

#### 2. STATION - Datos de estaciones
```typescript
const stationData = [
  {
    id: 1,
    name: "Estación Norte",
    current_level: 2.4,
    last_measurement: "2025-01-13T10:30:00Z"
  }
];

DataNormalizationService.normalize(stationData, DataSourceType.STATION);
```

#### 3. API_V1 - API externa versión 1
```typescript
const apiV1Data = [
  {
    time: "2025-01-13T08:00:00Z",
    level: 2.2,
    location: "Sensor A1",
    sensor_id: "A1"
  }
];

DataNormalizationService.normalize(apiV1Data, DataSourceType.API_V1);
```

#### 4. API_V2 - API externa versión 2
```typescript
const apiV2Data = [
  {
    datetime: "2025-01-13T08:00:00Z",
    water_height: 2.0,
    sensor_name: "Device B2",
    device_id: "B2"
  }
];

DataNormalizationService.normalize(apiV2Data, DataSourceType.API_V2);
```

#### 5. CSV - Importación desde CSV
```typescript
const csvData = [
  {
    fecha: "2025-01-13T08:00:00Z",
    nivel: 1.9,
    estacion: "CSV Import 1"
  }
];

DataNormalizationService.normalize(csvData, DataSourceType.CSV);
```

#### 6. JSON - Datos JSON genéricos
```typescript
const jsonData = [
  {
    someTimestamp: "2025-01-13T08:00:00Z",
    waterLevel: 2.1,
    locationName: "JSON Source"
  }
];

DataNormalizationService.normalize(jsonData, DataSourceType.JSON);
```

## 🔧 Implementación Técnica

### Método Principal

```typescript
export class DataNormalizationService {
  static normalize(rawData: any[], sourceType: DataSourceType): ChartDataSet {
    switch (sourceType) {
      case DataSourceType.MEASUREMENT:
        return this.normalizeMeasurements(rawData);
      
      case DataSourceType.STATION:
        return this.normalizeStations(rawData);
      
      case DataSourceType.API_V1:
        return this.normalizeApiV1(rawData);
      
      case DataSourceType.API_V2:
        return this.normalizeApiV2(rawData);
      
      case DataSourceType.CSV:
        return this.normalizeCsv(rawData);
      
      case DataSourceType.JSON:
        return this.normalizeJson(rawData);
      
      default:
        throw new Error(`Tipo de fuente de datos no soportado: ${sourceType}`);
    }
  }
}
```

### Método de Normalización Específico

```typescript
private static normalizeMeasurements(data: any[]): ChartDataSet {
  const normalizedData = data.map(item => ({
    timestamp: item.timestamp || item.created_at || item.date,
    value: parseFloat(item.value || item.water_level || item.level || 0),
    label: item.station_name || item.station || 'Sin estación',
    station: item.station_id?.toString() || item.id?.toString()
  }));

  return {
    data: normalizedData,
    metadata: {
      type: 'measurement',
      source: 'measurements',
      unit: 'm',
      range: this.calculateRange(normalizedData.map(d => d.value))
    }
  };
}
```

### Configuración de Gráficos Automática

```typescript
static getChartConfig(dataSet: ChartDataSet) {
  const { metadata } = dataSet;
  
  const baseConfig = {
    xAxisKey: 'timestamp',
    yAxisKey: 'value',
    unit: metadata.unit,
    color: 'var(--gov-primary)',
    strokeWidth: 2,
    dotRadius: 4,
    formatValue: (value: number) => `${value.toFixed(2)}${metadata.unit}`,
    formatTimestamp: (timestamp: string) => {
      return new Date(timestamp).toLocaleTimeString("es-CL", { 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
  };

  switch (metadata.type) {
    case 'measurement':
      return { ...baseConfig, color: 'var(--gov-primary)', strokeWidth: 3 };
    
    case 'station':
      return { ...baseConfig, color: 'var(--gov-green)', dotRadius: 6 };
    
    case 'alert':
      return { ...baseConfig, color: 'var(--gov-secondary)', strokeWidth: 4 };
    
    case 'report':
      return { ...baseConfig, color: 'var(--gov-orange)' };
    
    default:
      return { ...baseConfig, color: 'var(--gov-gray-b)' };
  }
}
```

## 🎨 Componente NormalizedChart

### Uso Básico

```typescript
import { NormalizedChart } from "@presentation/components/charts/NormalizedChart";
import { DataSourceType } from "@shared/services/DataNormalizationService";

function MyComponent() {
  const rawData = [/* datos de cualquier fuente */];

  return (
    <NormalizedChart 
      rawData={rawData}
      sourceType={DataSourceType.MEASUREMENT}
      height={300}
    />
  );
}
```

### Implementación del Componente

```typescript
interface NormalizedChartProps {
  rawData: any[];
  sourceType: DataSourceType;
  height?: number;
  className?: string;
}

export function NormalizedChart({ rawData, sourceType, height = 300 }: NormalizedChartProps) {
  const normalizedDataSet = DataNormalizationService.normalize(rawData, sourceType);
  const chartConfig = DataNormalizationService.getChartConfig(normalizedDataSet);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={normalizedDataSet.data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--gov-accent)" />
        <XAxis
          dataKey={chartConfig.xAxisKey}
          tickFormatter={chartConfig.formatTimestamp}
        />
        <YAxis 
          tickFormatter={(value) => chartConfig.formatValue(value)}
        />
        <Tooltip
          labelFormatter={(value) => `Hora: ${chartConfig.formatTimestamp(value as string)}`}
          formatter={(value: any) => [
            chartConfig.formatValue(value), 
            normalizedDataSet.metadata.type
          ]}
        />
        <Line
          type="monotone"
          dataKey={chartConfig.yAxisKey}
          stroke={chartConfig.color}
          strokeWidth={chartConfig.strokeWidth}
          dot={{ fill: chartConfig.color, r: chartConfig.dotRadius }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## 🏪 Integración con Stores

### MeasurementStore con Normalización

```typescript
interface MeasurementState {
  latestMeasurements: Measurement[];
  normalizedLatest: ChartDataSet | null;
  
  fetchLatestMeasurements: (stationId?: number) => Promise<void>;
  getNormalizedData: (type: 'latest' | 'historical', sourceType?: DataSourceType) => ChartDataSet;
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  latestMeasurements: [],
  normalizedLatest: null,

  fetchLatestMeasurements: async (stationId?: number) => {
    set({ loading: true });
    try {
      const measurements = await container.getLatestMeasurementsUseCase.execute(stationId);
      const normalized = DataNormalizationService.normalize(measurements, DataSourceType.MEASUREMENT);
      
      set({ 
        latestMeasurements: measurements, 
        normalizedLatest: normalized,
        loading: false 
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  getNormalizedData: (type: 'latest' | 'historical', sourceType = DataSourceType.MEASUREMENT) => {
    const state = get();
    const data = type === 'latest' ? state.latestMeasurements : state.historicalMeasurements;
    return DataNormalizationService.normalize(data, sourceType);
  }
}));
```

## 🌟 Casos de Uso Reales

### 1. Migración de Desarrollo a Producción

```typescript
// ❌ ANTES: Cambiar múltiples componentes
function DashboardPage() {
  // En desarrollo
  const mockData = latestMeasurements.map(item => ({
    time: item.timestamp,
    level: item.value
  }));

  // En producción - ¡Hay que cambiar todo el mapeo!
  const prodData = apiData.map(item => ({
    time: item.measurement_time,  // Diferente campo
    level: item.water_level       // Diferente campo
  }));

  return <LineChart data={mockData} />; // ¡Solo funciona con un formato!
}

// ✅ DESPUÉS: Un solo cambio
function DashboardPage() {
  return (
    <NormalizedChart 
      rawData={dataFromAnySource}
      sourceType={DataSourceType.MEASUREMENT} // ← Solo esto cambia
    />
  );
}
```

### 2. Importar Datos Históricos desde CSV

```typescript
// Usuario sube archivo CSV con formato:
// fecha,nivel,estacion
// 2025-01-13T08:00:00Z,2.3,Norte

function ImportPage() {
  const handleCsvUpload = (csvData: any[]) => {
    // ✅ Funciona automáticamente sin parsing manual
    return (
      <NormalizedChart 
        rawData={csvData}
        sourceType={DataSourceType.CSV}
      />
    );
  };
}
```

### 3. Cambio de API Externa

```typescript
// ❌ ANTES: Cambiar lógica en cada componente
function ReportsPage() {
  // API V1
  const dataV1 = apiData.map(item => ({
    timestamp: item.time,
    value: item.level
  }));

  // API V2 - ¡Diferente mapeo!
  const dataV2 = apiData.map(item => ({
    timestamp: item.datetime,
    value: item.water_height
  }));
}

// ✅ DESPUÉS: Solo cambiar el tipo
function ReportsPage() {
  return (
    <NormalizedChart 
      rawData={apiData}
      sourceType={DataSourceType.API_V2} // ← Solo cambio aquí
    />
  );
}
```

### 4. Dashboard con Múltiples Fuentes

```typescript
function MultiSourceDashboard() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Mediciones internas */}
      <NormalizedChart 
        rawData={measurements}
        sourceType={DataSourceType.MEASUREMENT}
      />
      
      {/* Datos de estaciones */}
      <NormalizedChart 
        rawData={stations}
        sourceType={DataSourceType.STATION}
      />
      
      {/* API externa */}
      <NormalizedChart 
        rawData={externalData}
        sourceType={DataSourceType.API_V1}
      />
      
      {/* Datos importados */}
      <NormalizedChart 
        rawData={importedData}
        sourceType={DataSourceType.CSV}
      />
    </div>
  );
}
```

## 🔧 Extensión: Agregar Nueva Fuente

### Paso 1: Agregar al Enum

```typescript
export enum DataSourceType {
  // ... tipos existentes
  IOT_SENSOR = 'iot_sensor',
  SATELLITE = 'satellite'
}
```

### Paso 2: Implementar Normalización

```typescript
static normalize(rawData: any[], sourceType: DataSourceType): ChartDataSet {
  switch (sourceType) {
    // ... casos existentes
    
    case DataSourceType.IOT_SENSOR:
      return this.normalizeIoTSensor(rawData);
    
    case DataSourceType.SATELLITE:
      return this.normalizeSatellite(rawData);
  }
}

private static normalizeIoTSensor(data: any[]): ChartDataSet {
  const normalizedData = data.map(item => ({
    timestamp: item.reading_time,
    value: parseFloat(item.sensor_value),
    label: item.device_name,
    station: item.device_id
  }));

  return {
    data: normalizedData,
    metadata: {
      type: 'iot_sensor',
      source: 'iot_platform',
      unit: 'm'
    }
  };
}
```

### Paso 3: Usar Inmediatamente

```typescript
// ✅ Ya funciona automáticamente
<NormalizedChart 
  rawData={iotSensorData}
  sourceType={DataSourceType.IOT_SENSOR}
/>
```

## 📊 Ejemplo Interactivo

El proyecto incluye un ejemplo interactivo en `src/examples/DataNormalizationExamples.tsx`:

```typescript
// Página de demostración
function DataNormalizationDemo() {
  const [selectedSource, setSelectedSource] = useState('measurements');
  
  return (
    <div>
      {/* Selector de fuente */}
      <SourceSelector onChange={setSelectedSource} />
      
      {/* Datos originales */}
      <CodeBlock data={exampleData[selectedSource]} />
      
      {/* Datos normalizados */}
      <CodeBlock data={DataNormalizationService.normalize(
        exampleData[selectedSource],
        sourceTypeMapping[selectedSource]
      )} />
      
      {/* Gráfico automático */}
      <NormalizedChart 
        rawData={exampleData[selectedSource]}
        sourceType={sourceTypeMapping[selectedSource]}
      />
    </div>
  );
}
```

## 💡 Beneficios Clave

### ✅ Para Desarrollo

1. **Tiempo ahorrado**: No reescribir componentes para cada fuente
2. **Menos errores**: Lógica centralizada de transformación
3. **Código limpio**: Separación clara de responsabilidades
4. **Testeable**: Fácil probar la normalización por separado

### ✅ Para Producción

1. **Escalabilidad**: Agregar nuevas fuentes sin romper código existente
2. **Mantenibilidad**: Un solo lugar para modificar transformaciones
3. **Flexibilidad**: Cambiar APIs sin afectar la UI
4. **Robustez**: Manejo consistente de errores y casos edge

### ✅ Para el Futuro

1. **Preparado para cambios**: APIs, formatos, fuentes nuevas
2. **Reutilizable**: El servicio se puede usar en otros proyectos
3. **Documentado**: Claro cómo agregar nuevas fuentes
4. **Estándar**: Patrón establecido para el equipo

## 🚀 Conclusión

El `DataNormalizationService` es una **inversión a futuro** que:

- **Elimina refactoring masivo** cuando cambias fuentes de datos
- **Centraliza la lógica** de transformación de datos
- **Hace el código más mantenible** y escalable
- **Permite migración sin dolor** de desarrollo a producción

**En lugar de adaptar todo de nuevo cada vez, solo cambias una línea de código** 🎉