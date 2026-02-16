import { MeasurementConfiguration, MeasurementConfigurationFilters, CreateMeasurementConfigurationData, UpdateMeasurementConfigurationData } from '@domain/entities/MeasurementConfiguration';
import { MeasurementConfigurationRepository } from '@domain/repositories/MeasurementConfigurationRepository';
import { ApiClient } from './ApiClient';

interface ApiMeasurementConfigurationData {
  id: number;
  station: number;
  station_name?: string;
  measurement_interval_minutes: number;
  data_retention_days: number;
  auto_alerts_enabled: boolean;
  notification_email?: string;
  created_at: string;
  updated_at: string;
}

export class ApiMeasurementConfigurationRepository implements MeasurementConfigurationRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(filters?: MeasurementConfigurationFilters): Promise<MeasurementConfiguration[]> {
    let endpoint = '/api/measurements/configurations/';

    const queryParams = new URLSearchParams();

    if (filters?.station_id) {
      queryParams.append('station_id', filters.station_id.toString());
    }

    endpoint += `?${queryParams}`;

    const response = await this.apiClient.get<ApiMeasurementConfigurationData[]>(endpoint);
    return response.map(this.convertApiToMeasurementConfiguration);
  }

  async findById(id: number): Promise<MeasurementConfiguration | null> {
    try {
      const response = await this.apiClient.get<ApiMeasurementConfigurationData>(`/api/measurements/configurations/${id}/`);
      return this.convertApiToMeasurementConfiguration(response);
    } catch {
      return null;
    }
  }

  async findByStation(stationId: number): Promise<MeasurementConfiguration | null> {
    const configs = await this.findAll({ station_id: stationId });
    return configs.length > 0 ? configs[0] : null;
  }

  async create(data: CreateMeasurementConfigurationData): Promise<MeasurementConfiguration> {
    const response = await this.apiClient.post<ApiMeasurementConfigurationData>('/api/measurements/configurations/', data);
    return this.convertApiToMeasurementConfiguration(response);
  }

  async update(id: number, data: UpdateMeasurementConfigurationData): Promise<MeasurementConfiguration> {
    const response = await this.apiClient.patch<ApiMeasurementConfigurationData>(`/api/measurements/configurations/${id}/`, data);
    return this.convertApiToMeasurementConfiguration(response);
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete(`/api/measurements/configurations/${id}/`);
  }

  private convertApiToMeasurementConfiguration(data: ApiMeasurementConfigurationData): MeasurementConfiguration {
    return {
      id: data.id,
      station_id: data.station,
      station_name: data.station_name,
      measurement_interval_minutes: data.measurement_interval_minutes,
      data_retention_days: data.data_retention_days,
      auto_alerts_enabled: data.auto_alerts_enabled,
      notification_email: data.notification_email,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}
