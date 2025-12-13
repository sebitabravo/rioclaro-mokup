import { Threshold, ThresholdFilters, CreateThresholdData, UpdateThresholdData } from '@domain/entities/Threshold';
import { ThresholdRepository } from '@domain/repositories/ThresholdRepository';
import { ApiClient } from './ApiClient';

interface ApiThresholdData {
  id: number;
  station: number;
  station_name?: string;
  measurement_type: string;
  measurement_type_display?: string;
  warning_min?: number;
  warning_max?: number;
  critical_min?: number;
  critical_max?: number;
  unit: string;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export class ApiThresholdRepository implements ThresholdRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(filters?: ThresholdFilters): Promise<Threshold[]> {
    let endpoint = '/api/measurements/thresholds/';

    const queryParams = new URLSearchParams();

    if (filters?.station_id) {
      queryParams.append('station_id', filters.station_id.toString());
    }

    if (filters?.measurement_type) {
      queryParams.append('measurement_type', filters.measurement_type);
    }

    if (filters?.is_active !== undefined) {
      queryParams.append('is_active', filters.is_active.toString());
    }

    endpoint += `?${queryParams}`;

    const response = await this.apiClient.get<ApiThresholdData[]>(endpoint);
    return response.map(this.convertApiToThreshold);
  }

  async findById(id: number): Promise<Threshold | null> {
    try {
      const response = await this.apiClient.get<ApiThresholdData>(`/api/measurements/thresholds/${id}/`);
      return this.convertApiToThreshold(response);
    } catch (error) {
      return null;
    }
  }

  async create(data: CreateThresholdData): Promise<Threshold> {
    const response = await this.apiClient.post<ApiThresholdData>('/api/measurements/thresholds/', data);
    return this.convertApiToThreshold(response);
  }

  async update(id: number, data: UpdateThresholdData): Promise<Threshold> {
    const response = await this.apiClient.patch<ApiThresholdData>(`/api/measurements/thresholds/${id}/`, data);
    return this.convertApiToThreshold(response);
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete(`/api/measurements/thresholds/${id}/`);
  }

  private convertApiToThreshold(data: ApiThresholdData): Threshold {
    return {
      id: data.id,
      station_id: data.station,
      station_name: data.station_name,
      measurement_type: data.measurement_type,
      measurement_type_display: data.measurement_type_display,
      warning_min: data.warning_min,
      warning_max: data.warning_max,
      critical_min: data.critical_min,
      critical_max: data.critical_max,
      unit: data.unit,
      is_active: data.is_active,
      created_by: data.created_by,
      updated_by: data.updated_by,
      created_at: data.created_at,
      updated_at: data.updated_at,
      notes: data.notes
    };
  }
}