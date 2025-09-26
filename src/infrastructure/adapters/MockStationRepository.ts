import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';
import { PaginationParams, PaginatedResult, StationFilters } from '@shared/types/pagination';
import { mockStations } from './MockDataRepository';

export class MockStationRepository implements StationRepository {
  private stations: Station[] = [...mockStations];

  async findAll(): Promise<Station[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.stations];
  }

  async findById(id: number): Promise<Station | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.stations.find(station => station.id === id) || null;
  }

  async findPaginated(params: PaginationParams, filters?: StationFilters): Promise<PaginatedResult<Station>> {
    await new Promise(resolve => setTimeout(resolve, 400));

    // Aplicar filtros
    let filteredStations = [...this.stations];

    if (filters) {
      filteredStations = filteredStations.filter(station => {
        if (filters.name && !station.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return false;
        }
        if (filters.code && !station.code.toLowerCase().includes(filters.code.toLowerCase())) {
          return false;
        }
        if (filters.location && !station.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        if (filters.status && station.status !== filters.status) {
          return false;
        }
        if (filters.latitude) {
          if (filters.latitude.min !== undefined && station.latitude < filters.latitude.min) {
            return false;
          }
          if (filters.latitude.max !== undefined && station.latitude > filters.latitude.max) {
            return false;
          }
        }
        if (filters.longitude) {
          if (filters.longitude.min !== undefined && station.longitude < filters.longitude.min) {
            return false;
          }
          if (filters.longitude.max !== undefined && station.longitude > filters.longitude.max) {
            return false;
          }
        }
        if (filters.threshold) {
          if (filters.threshold.min !== undefined && station.threshold < filters.threshold.min) {
            return false;
          }
          if (filters.threshold.max !== undefined && station.threshold > filters.threshold.max) {
            return false;
          }
        }
        if (filters.current_level) {
          if (filters.current_level.min !== undefined && station.current_level < filters.current_level.min) {
            return false;
          }
          if (filters.current_level.max !== undefined && station.current_level > filters.current_level.max) {
            return false;
          }
        }
        return true;
      });
    }

    // Aplicar ordenamiento
    if (params.sortBy) {
      filteredStations.sort((a, b) => {
        const aValue = a[params.sortBy as keyof Station];
        const bValue = b[params.sortBy as keyof Station];

        if (aValue === bValue) return 0;

        const comparison = aValue < bValue ? -1 : 1;
        return params.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Calcular paginación
    const total = filteredStations.length;
    const totalPages = Math.ceil(total / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const data = filteredStations.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
    };
  }

  async create(stationData: Omit<Station, 'id' | 'created_at' | 'updated_at'>): Promise<Station> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newStation: Station = {
      ...stationData,
      id: Math.max(...this.stations.map(s => s.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.stations.push(newStation);
    return newStation;
  }

  async update(id: number, stationData: Partial<Station>): Promise<Station | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = this.stations.findIndex(station => station.id === id);
    if (index === -1) return null;
    
    this.stations[index] = {
      ...this.stations[index],
      ...stationData,
      updated_at: new Date().toISOString(),
    };
    
    return this.stations[index];
  }

  async delete(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.stations.findIndex(station => station.id === id);
    if (index === -1) return false;
    
    this.stations.splice(index, 1);
    return true;
  }
}