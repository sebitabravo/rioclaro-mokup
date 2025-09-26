import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';
import { PaginationParams, PaginatedResult, StationFilters } from '@shared/types/pagination';
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

  async findPaginated(params: PaginationParams, filters?: StationFilters): Promise<PaginatedResult<Station>> {
    // Construir query parameters para la API
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
    });

    if (params.sortBy) {
      queryParams.append('sort_by', params.sortBy);
    }

    if (params.sortOrder) {
      queryParams.append('sort_order', params.sortOrder);
    }

    // Agregar filtros como query parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && (value.min !== undefined || value.max !== undefined)) {
            // Para filtros de rango como latitude, longitude, etc.
            if (value.min !== undefined) {
              queryParams.append(`${key}_min`, value.min.toString());
            }
            if (value.max !== undefined) {
              queryParams.append(`${key}_max`, value.max.toString());
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const response = await this.apiClient.get<PaginatedResult<Station>>(`/monitoring/stations/paginated/?${queryParams}`);
    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('No se recibieron datos del servidor');
    }

    return response.data;
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