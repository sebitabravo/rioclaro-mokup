import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';
import { ApiClient } from './ApiClient';

export class ApiStationRepository implements StationRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<Station[]> {
    const response = await this.apiClient.get<Station[]>('/monitoring/stations/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  async findById(id: number): Promise<Station | null> {
    const response = await this.apiClient.get<Station>(`/monitoring/stations/${id}/`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || null;
  }

  async create(stationData: Omit<Station, 'id' | 'created_at' | 'updated_at'>): Promise<Station> {
    const response = await this.apiClient.post<Station>('/monitoring/stations/', stationData);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('No se recibieron datos del servidor');
    }
    return response.data;
  }

  async update(id: number, stationData: Partial<Station>): Promise<Station | null> {
    const response = await this.apiClient.patch<Station>(`/monitoring/stations/${id}/`, stationData);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || null;
  }

  async delete(id: number): Promise<boolean> {
    const response = await this.apiClient.delete(`/monitoring/stations/${id}/`);
    return !response.error;
  }
}