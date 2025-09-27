import type {
  MeasurementDataArray,
  StationDataArray,
  AlertDataArray,
  ReportDataArray,
  ApiV1DataArray,
  ApiV2DataArray,
  CsvDataArray,
  JsonDataArray
} from '../types/data-sources';

import {
  parseToNumber,
  parseToString,
  parseToTimestamp,
  DataNormalizationError,
  InvalidDataFormatError
} from '../types/data-sources';

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  station?: string;
}

export interface ChartDataSet {
  data: ChartDataPoint[];
  metadata: {
    type: DataSourceType;
    source: string;
    unit: string;
    range?: { min: number; max: number };
  };
}

export enum DataSourceType {
  MEASUREMENT = 'measurement',
  STATION = 'station',
  ALERT = 'alert',
  REPORT = 'report',
  API_V1 = 'api_v1',
  API_V2 = 'api_v2',
  CSV = 'csv',
  JSON = 'json'
}

// Type-safe mapping for input data based on source type
type DataSourceInputMap = {
  [DataSourceType.MEASUREMENT]: MeasurementDataArray;
  [DataSourceType.STATION]: StationDataArray;
  [DataSourceType.ALERT]: AlertDataArray;
  [DataSourceType.REPORT]: ReportDataArray;
  [DataSourceType.API_V1]: ApiV1DataArray;
  [DataSourceType.API_V2]: ApiV2DataArray;
  [DataSourceType.CSV]: CsvDataArray;
  [DataSourceType.JSON]: JsonDataArray;
};

export class DataNormalizationService {
  /**
   * Normaliza datos de diferentes fuentes con type safety completo
   */
  static normalize<T extends DataSourceType>(
    rawData: DataSourceInputMap[T],
    sourceType: T
  ): ChartDataSet {
    try {
      // Validación de entrada
      this.validateInput(rawData, sourceType);

      switch (sourceType) {
        case DataSourceType.MEASUREMENT:
          return this.normalizeMeasurements(rawData as MeasurementDataArray);

        case DataSourceType.STATION:
          return this.normalizeStations(rawData as StationDataArray);

        case DataSourceType.ALERT:
          return this.normalizeAlerts(rawData as AlertDataArray);

        case DataSourceType.REPORT:
          return this.normalizeReports(rawData as ReportDataArray);

        case DataSourceType.API_V1:
          return this.normalizeApiV1(rawData as ApiV1DataArray);

        case DataSourceType.API_V2:
          return this.normalizeApiV2(rawData as ApiV2DataArray);

        case DataSourceType.CSV:
          return this.normalizeCsv(rawData as CsvDataArray);

        case DataSourceType.JSON:
          return this.normalizeJson(rawData as JsonDataArray);

        default:
          // Esta línea nunca debería ejecutarse debido al type checking
          throw new DataNormalizationError(
            `Tipo de fuente de datos no soportado: ${sourceType}`,
            sourceType as string,
            rawData
          );
      }
    } catch (error) {
      if (error instanceof DataNormalizationError) {
        throw error;
      }

      throw new DataNormalizationError(
        `Error inesperado durante la normalización: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        sourceType as string,
        rawData
      );
    }
  }

  /**
   * Valida la entrada de datos antes del procesamiento
   */
  private static validateInput<T extends DataSourceType>(
    rawData: DataSourceInputMap[T],
    sourceType: T
  ): void {
    if (!rawData) {
      throw new InvalidDataFormatError(sourceType, 'Array de datos', rawData);
    }

    if (!Array.isArray(rawData)) {
      throw new InvalidDataFormatError(sourceType, 'Array', typeof rawData);
    }

    // Allow empty arrays - return empty dataset instead of throwing error
  }


  /**
   * Normaliza datos de mediciones con type safety
   */
  private static normalizeMeasurements(data: MeasurementDataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item) => ({
      timestamp: parseToTimestamp(item.timestamp || item.created_at || item.date),
      value: parseToNumber(item.value || item.water_level || item.level),
      label: parseToString(item.station_name || item.station || 'Sin estación'),
      station: parseToString(item.station_id || item.id)
    }));

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.MEASUREMENT,
        source: 'measurements',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  /**
   * Normaliza datos de estaciones con type safety
   */
  private static normalizeStations(data: StationDataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item) => ({
      timestamp: parseToTimestamp(item.last_measurement || item.updated_at),
      value: parseToNumber(item.current_level || item.level || item.value),
      label: parseToString(item.name || item.station_name || 'Sin nombre'),
      station: parseToString(item.id || item.station_id)
    }));

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.STATION,
        source: 'stations',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  /**
   * Normaliza datos de alertas con type safety
   */
  private static normalizeAlerts(data: AlertDataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item) => ({
      timestamp: parseToTimestamp(item.created_at || item.timestamp || item.date),
      value: parseToNumber(item.level || item.value || item.threshold),
      label: parseToString(item.message || item.description || 'Alerta'),
      station: parseToString(item.station_id || item.id)
    }));

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.ALERT,
        source: 'alerts',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  /**
   * Normaliza datos de reportes con type safety
   */
  private static normalizeReports(data: ReportDataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item) => ({
      timestamp: parseToTimestamp(item.date || item.timestamp || item.created_at),
      value: parseToNumber(item.average_level || item.max_level || item.value),
      label: parseToString(item.period || item.type || 'Reporte'),
      station: parseToString(item.station_id || 'all')
    }));

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.REPORT,
        source: 'reports',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  /**
   * Normaliza datos de API V1 con type safety
   */
  private static normalizeApiV1(data: ApiV1DataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item) => ({
      timestamp: parseToTimestamp(item.time || item.date || item.timestamp),
      value: parseToNumber(item.level || item.measurement || item.data),
      label: parseToString(item.location || item.name || 'API V1'),
      station: parseToString(item.sensor_id || item.id)
    }));

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.API_V1,
        source: 'external_api_v1',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  /**
   * Normaliza datos de API V2 con type safety
   */
  private static normalizeApiV2(data: ApiV2DataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item) => ({
      timestamp: parseToTimestamp(item.datetime || item.timestamp || item.recorded_at),
      value: parseToNumber(item.water_height || item.height || item.level),
      label: parseToString(item.sensor_name || item.device || 'API V2'),
      station: parseToString(item.device_id || item.sensor_id)
    }));

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.API_V2,
        source: 'external_api_v2',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  /**
   * Normaliza datos de CSV con type safety
   */
  private static normalizeCsv(data: CsvDataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item) => ({
      timestamp: parseToTimestamp(item.fecha || item.timestamp || item.date || item.time),
      value: parseToNumber(item.nivel || item.level || item.value || item.medicion),
      label: parseToString(item.estacion || item.station || item.nombre || 'CSV'),
      station: parseToString(item.id || item.station_id || 'csv')
    }));

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.CSV,
        source: 'csv_import',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  /**
   * Normaliza datos de JSON con type safety y detección automática de campos
   */
  private static normalizeJson(data: JsonDataArray): ChartDataSet {
    const normalizedData: ChartDataPoint[] = data.map((item, index) => {
      const keys = Object.keys(item);

      // Buscar campo de timestamp usando patrones comunes
      const timestampKey = keys.find(k =>
        k.toLowerCase().includes('time') ||
        k.toLowerCase().includes('date') ||
        k.toLowerCase().includes('fecha')
      );

      // Buscar campo de valor usando patrones comunes
      const valueKey = keys.find(k =>
        k.toLowerCase().includes('level') ||
        k.toLowerCase().includes('value') ||
        k.toLowerCase().includes('nivel') ||
        k.toLowerCase().includes('medicion')
      );

      // Buscar campo de etiqueta usando patrones comunes
      const labelKey = keys.find(k =>
        k.toLowerCase().includes('name') ||
        k.toLowerCase().includes('station') ||
        k.toLowerCase().includes('label')
      );

      // Extraer valores con fallbacks seguros
      const timestampValue = timestampKey ? item[timestampKey] : undefined;
      const rawValue = valueKey ? item[valueKey] : Object.values(item)[0];
      const labelValue = labelKey ? item[labelKey] : `Item ${index + 1}`;

      return {
        timestamp: parseToTimestamp(timestampValue),
        value: parseToNumber(rawValue),
        label: parseToString(labelValue),
        station: parseToString(item.id || index.toString())
      };
    });

    return {
      data: normalizedData,
      metadata: {
        type: DataSourceType.JSON,
        source: 'json_import',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  private static calculateRange(values: number[]): { min: number; max: number } {
    if (values.length === 0) return { min: 0, max: 0 };
    
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  /**
   * Obtiene configuración del chart basada en el tipo de datos con type safety
   */
  static getChartConfig(dataSet: ChartDataSet): ChartConfig {
    const { metadata } = dataSet;

    const baseConfig: ChartConfig = {
      xAxisKey: 'timestamp' as const,
      yAxisKey: 'value' as const,
      unit: metadata.unit,
      color: 'var(--gov-primary)',
      strokeWidth: 2,
      dotRadius: 4,
      formatValue: (value: number) => `${value.toFixed(2)}${metadata.unit}`,
      formatTimestamp: (timestamp: string) => {
        try {
          return new Date(timestamp).toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit"
          });
        } catch {
          return timestamp;
        }
      }
    };

    switch (metadata.type) {
      case DataSourceType.MEASUREMENT:
        return {
          ...baseConfig,
          color: 'var(--gov-primary)',
          strokeWidth: 3,
          dotRadius: 4
        };

      case DataSourceType.STATION:
        return {
          ...baseConfig,
          color: 'var(--gov-green)',
          strokeWidth: 2,
          dotRadius: 6
        };

      case DataSourceType.ALERT:
        return {
          ...baseConfig,
          color: 'var(--gov-secondary)',
          strokeWidth: 4,
          dotRadius: 8
        };

      case DataSourceType.REPORT:
        return {
          ...baseConfig,
          color: 'var(--gov-orange)',
          strokeWidth: 2,
          dotRadius: 5
        };

      case DataSourceType.API_V1:
      case DataSourceType.API_V2:
        return {
          ...baseConfig,
          color: 'var(--gov-blue)',
          strokeWidth: 2,
          dotRadius: 5
        };

      case DataSourceType.CSV:
      case DataSourceType.JSON:
        return {
          ...baseConfig,
          color: 'var(--gov-purple)',
          strokeWidth: 2,
          dotRadius: 4
        };

      default:
        return {
          ...baseConfig,
          color: 'var(--gov-gray-b)',
          strokeWidth: 2,
          dotRadius: 4
        };
    }
  }
}

// ==========================================
// Interface para configuración de chart
// ==========================================
export interface ChartConfig {
  xAxisKey: 'timestamp';
  yAxisKey: 'value';
  unit: string;
  color: string;
  strokeWidth: number;
  dotRadius: number;
  formatValue: (value: number) => string;
  formatTimestamp: (timestamp: string) => string;
}