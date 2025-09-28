import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';
import { PaginationParams, PaginatedResult, StationFilters } from '@shared/types/pagination';
import { ApiClient } from './ApiClient';

interface ApiStationData {
  id: number;
  name: string;
  code: string;
  latitude: string;
  longitude: string;
  location?: string;
  description?: string;
  is_active: boolean;
  current_level?: number;
  threshold?: number;
  last_measurement?: string;
  created_at: string;
  updated_at: string;
}

export class ApiStationRepository implements StationRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<Station[]> {
    const response = await this.apiClient.get<{ results: ApiStationData[] }>('/api/stations/');
    return response.results.map(this.convertApiToStation);
  }

  async findById(id: number): Promise<Station | null> {
    const data = await this.apiClient.get<ApiStationData>(`/api/stations/${id}/`);
    return this.convertApiToStation(data);
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

    return await this.apiClient.get<PaginatedResult<Station>>(`/api/stations/paginated/?${queryParams}`);
  }

  async create(stationData: Omit<Station, 'id' | 'created_at' | 'updated_at'>): Promise<Station> {
    return await this.apiClient.post<Station>('/api/stations/', stationData);
  }

  async update(id: number, stationData: Partial<Station>): Promise<Station | null> {
    return await this.apiClient.patch<Station>(`/api/stations/${id}/`, stationData);
  }

  async delete(id: number): Promise<boolean> {
    await this.apiClient.delete(`/api/stations/${id}/`);
    return true;
  }

  /**
   * Convierte el formato de la API Django al formato esperado por el frontend
   */
  private convertApiToStation(data: ApiStationData): Station {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      location: data.location || `${data.latitude}, ${data.longitude}`,
      latitude: parseFloat(data.latitude),  // Convertir string a número
      longitude: parseFloat(data.longitude), // Convertir string a número
      status: data.is_active ? 'active' : 'inactive',
      current_level: data.current_level || 0,
      threshold: data.threshold || 0,
      last_measurement: data.last_measurement || new Date().toISOString(),
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}