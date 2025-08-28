export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
  station?: string;
}

export interface ChartDataSet {
  data: ChartDataPoint[];
  metadata: {
    type: string;
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

import type { ChartDataArray } from '../types/chart-data';

export class DataNormalizationService {
  static normalize(rawData: ChartDataArray, sourceType: DataSourceType): ChartDataSet {
    // Validar que rawData sea un array válido
    if (!rawData || !Array.isArray(rawData)) {
      return {
        data: [],
        metadata: {
          type: sourceType,
          source: 'empty',
          unit: 'm',
          range: { min: 0, max: 0 }
        }
      };
    }

    switch (sourceType) {
      case DataSourceType.MEASUREMENT:
        return this.normalizeMeasurements(rawData);
      
      case DataSourceType.STATION:
        return this.normalizeStations(rawData);
      
      case DataSourceType.ALERT:
        return this.normalizeAlerts(rawData);
      
      case DataSourceType.REPORT:
        return this.normalizeReports(rawData);
      
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

  private static normalizeMeasurements(data: ChartDataArray): ChartDataSet {
    // Validación adicional por si acaso
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        data: [],
        metadata: {
          type: 'measurement',
          source: 'measurements',
          unit: 'm',
          range: { min: 0, max: 0 }
        }
      };
    }

    const normalizedData = data.map((item: any) => ({
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

  private static normalizeStations(data: ChartDataArray): ChartDataSet {
    const normalizedData = data.map((item: any) => ({
      timestamp: item.last_measurement || item.updated_at || new Date().toISOString(),
      value: parseFloat(item.current_level || item.level || item.value || 0),
      label: item.name || item.station_name || 'Sin nombre',
      station: item.id?.toString() || item.station_id?.toString()
    }));

    return {
      data: normalizedData,
      metadata: {
        type: 'station',
        source: 'stations',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  private static normalizeAlerts(data: ChartDataArray): ChartDataSet {
    const normalizedData = data.map((item: any) => ({
      timestamp: item.created_at || item.timestamp || item.date,
      value: parseFloat(item.level || item.value || item.threshold || 0),
      label: item.message || item.description || 'Alerta',
      station: item.station_id?.toString() || item.id?.toString()
    }));

    return {
      data: normalizedData,
      metadata: {
        type: 'alert',
        source: 'alerts',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  private static normalizeReports(data: ChartDataArray): ChartDataSet {
    const normalizedData = data.map((item: any) => ({
      timestamp: item.date || item.timestamp || item.created_at,
      value: parseFloat(item.average_level || item.max_level || item.value || 0),
      label: item.period || item.type || 'Reporte',
      station: item.station_id?.toString() || 'all'
    }));

    return {
      data: normalizedData,
      metadata: {
        type: 'report',
        source: 'reports',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  private static normalizeApiV1(data: ChartDataArray): ChartDataSet {
    const normalizedData = data.map((item: any) => ({
      timestamp: item.time || item.date || item.timestamp,
      value: parseFloat(item.level || item.measurement || item.data || 0),
      label: item.location || item.name || 'API V1',
      station: item.sensor_id || item.id?.toString()
    }));

    return {
      data: normalizedData,
      metadata: {
        type: 'api_v1',
        source: 'external_api_v1',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  private static normalizeApiV2(data: ChartDataArray): ChartDataSet {
    const normalizedData = data.map((item: any) => ({
      timestamp: item.datetime || item.timestamp || item.recorded_at,
      value: parseFloat(item.water_height || item.height || item.level || 0),
      label: item.sensor_name || item.device || 'API V2',
      station: item.device_id || item.sensor_id?.toString()
    }));

    return {
      data: normalizedData,
      metadata: {
        type: 'api_v2',
        source: 'external_api_v2',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  private static normalizeCsv(data: ChartDataArray): ChartDataSet {
    const normalizedData = data.map((item: any) => ({
      timestamp: item.fecha || item.timestamp || item.date || item.time,
      value: parseFloat(item.nivel || item.level || item.value || item.medicion || 0),
      label: item.estacion || item.station || item.nombre || 'CSV',
      station: item.id || item.station_id || 'csv'
    }));

    return {
      data: normalizedData,
      metadata: {
        type: 'csv',
        source: 'csv_import',
        unit: 'm',
        range: this.calculateRange(normalizedData.map(d => d.value))
      }
    };
  }

  private static normalizeJson(data: ChartDataArray): ChartDataSet {
    const normalizedData = data.map((item, index) => {
      const keys = Object.keys(item as Record<string, unknown>);
      const timestampKey = keys.find(k => 
        k.toLowerCase().includes('time') || 
        k.toLowerCase().includes('date') || 
        k.toLowerCase().includes('fecha')
      );
      const valueKey = keys.find(k => 
        k.toLowerCase().includes('level') || 
        k.toLowerCase().includes('value') || 
        k.toLowerCase().includes('nivel') ||
        k.toLowerCase().includes('medicion')
      );
      const labelKey = keys.find(k => 
        k.toLowerCase().includes('name') || 
        k.toLowerCase().includes('station') || 
        k.toLowerCase().includes('label')
      );

      return {
        timestamp: timestampKey ? String(item[timestampKey]) : new Date().toISOString(),
        value: parseFloat(valueKey ? String(item[valueKey]) : String(Object.values(item as Record<string, unknown>)[0]) || '0'),
        label: labelKey ? String(item[labelKey]) : `Item ${index + 1}`,
        station: item.id?.toString() || index.toString()
      };
    });

    return {
      data: normalizedData,
      metadata: {
        type: 'json',
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
      case 'measurement':
        return {
          ...baseConfig,
          color: 'var(--gov-primary)',
          strokeWidth: 3,
          dotRadius: 4
        };
      
      case 'station':
        return {
          ...baseConfig,
          color: 'var(--gov-green)',
          strokeWidth: 2,
          dotRadius: 6
        };
      
      case 'alert':
        return {
          ...baseConfig,
          color: 'var(--gov-secondary)',
          strokeWidth: 4,
          dotRadius: 8
        };
      
      case 'report':
        return {
          ...baseConfig,
          color: 'var(--gov-orange)',
          strokeWidth: 2,
          dotRadius: 5
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