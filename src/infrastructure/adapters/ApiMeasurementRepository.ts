import { Measurement, MeasurementFilters } from '@domain/entities/Measurement';
import { MeasurementRepository } from '@domain/repositories/MeasurementRepository';
import { ApiClient } from './ApiClient';

interface ApiMeasurementData {
  id: number;
  station_id: number;
  station?: number;
  station_name?: string;
  station_details?: { name: string };
  variable_type: string;
  value: number | string;
  unit: string;
  timestamp: string;
  is_critical: boolean;
  quality?: 'good' | 'fair' | 'poor';
  measurement_type?: string;
  measurement_type_display?: string;
  sensor_type_details?: { name: string; unit?: string };
  metadata?: { variable_type?: string; unit?: string; is_critical?: boolean; quality?: 'good' | 'fair' | 'poor'; error?: boolean };
}

export class ApiMeasurementRepository implements MeasurementRepository {
  constructor(private apiClient: ApiClient) {
    // Bind methods to preserve 'this' context
    this.convertToMeasurement = this.convertToMeasurement.bind(this);
    this.determineQuality = this.determineQuality.bind(this);
  }

  async findLatest(stationId?: number): Promise<Measurement[]> {
    let endpoint: string;

    if (stationId) {
      // Usar endpoint específico para una estación
      endpoint = `/api/measurements/stations/${stationId}/latest/`;
    } else {
      // Usar endpoint para todas las estaciones
      endpoint = '/api/measurements/latest/';
    }

    const response = await this.apiClient.get<ApiMeasurementData[]>(endpoint);

    // Convertir los datos al formato esperado por el frontend
    return response.map(this.convertApiToMeasurement);
  }

  async findHistorical(filters: MeasurementFilters): Promise<Measurement[]> {
    // Usar el endpoint del module4 que tiene los datos reales
    let endpoint = '/api/measurements/module4/extensible-measurements/';

    const queryParams = new URLSearchParams();

    if (filters.station_id) {
      queryParams.append('station', filters.station_id.toString());
    }

    if (filters.start_date) {
      queryParams.append('timestamp__gte', filters.start_date);
    }

    if (filters.end_date) {
      queryParams.append('timestamp__lte', filters.end_date);
    }

    if (filters.variable_type) {
      // En module4, necesitamos filtrar por sensor_type__name
      queryParams.append('sensor_type__name', filters.variable_type);
    }

    queryParams.append('ordering', '-timestamp'); // Ordenar por timestamp descendente

    endpoint += `?${queryParams}`;

    const response = await this.apiClient.get<{ results: ApiMeasurementData[] }>(endpoint);

    // Convertir el formato del module4 al formato esperado por el frontend
    return response.results.map(this.convertToMeasurement);
  }

  async create(measurement: Omit<Measurement, 'id'>): Promise<Measurement> {
    // Crear en el module4
    const module4Data = {
      sensor_type: measurement.station_id, // Esto necesitará ajustarse según el sensor
      station: measurement.station_id,
      value: measurement.value.toString(),
      timestamp: measurement.timestamp,
      metadata: {
        source: 'frontend',
        variable_type: measurement.variable_type,
        unit: measurement.unit,
        is_critical: measurement.is_critical
      }
    };

    const response = await this.apiClient.post<ApiMeasurementData>('/api/measurements/module4/extensible-measurements/', module4Data);
    return this.convertToMeasurement(response);
  }

  /**
   * Convierte el formato de la API simple al formato esperado por el frontend
   */
  private convertApiToMeasurement(data: ApiMeasurementData): Measurement {
    return {
      id: data.id,
      station_id: data.station || data.station_id,
      station_name: data.station_name,
      variable_type: data.measurement_type_display || data.measurement_type || data.variable_type,
      value: typeof data.value === 'string' ? parseFloat(data.value) : data.value,
      unit: data.unit,
      timestamp: data.timestamp,
      is_critical: data.is_critical || (typeof data.value === 'string' ? parseFloat(data.value) : data.value) > 250, // Ejemplo de lógica crítica
      quality: 'good'
    };
  }

  /**
   * Convierte el formato del module4 al formato esperado por el frontend
   */
  private convertToMeasurement(data: ApiMeasurementData): Measurement {
    return {
      id: data.id,
      station_id: data.station || data.station_id,
      station_name: data.station_details?.name,
      variable_type: data.sensor_type_details?.name || data.metadata?.variable_type || 'Unknown',
      value: typeof data.value === 'string' ? parseFloat(data.value) : data.value,
      unit: data.sensor_type_details?.unit || data.metadata?.unit || '',
      timestamp: data.timestamp,
      is_critical: data.metadata?.is_critical || false,
      quality: this.determineQuality(data)
    };
  }

  /**
   * Determina la calidad de la medición basada en los metadatos
   */
  private determineQuality(data: ApiMeasurementData): 'good' | 'fair' | 'poor' {
    if (data.metadata?.quality) {
      return data.metadata.quality;
    }

    // Heurística simple basada en si hay errores o datos anómalos
    if (data.metadata?.error) {
      return 'poor';
    }

    const value = typeof data.value === 'string' ? parseFloat(data.value) : data.value;
    if (isNaN(value) || value < 0) {
      return 'poor';
    }

    return 'good';
  }
}