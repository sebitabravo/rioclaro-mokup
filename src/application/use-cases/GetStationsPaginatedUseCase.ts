import { StationRepository } from '@domain/repositories/StationRepository';
import { PaginationParams, PaginatedResult, StationFilters } from '@shared/types/pagination';
import { Station } from '@domain/entities/Station';

export class GetStationsPaginatedUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(params: PaginationParams, filters?: StationFilters): Promise<PaginatedResult<Station>> {
    // Validar parámetros de paginación
    this.validatePaginationParams(params);

    // Validar filtros si están presentes
    if (filters) {
      this.validateFilters(filters);
    }

    // Ejecutar la consulta paginada
    return await this.stationRepository.findPaginated(params, filters);
  }

  private validatePaginationParams(params: PaginationParams): void {
    if (params.page < 1) {
      throw new Error('El número de página debe ser mayor a 0');
    }

    if (params.limit < 1) {
      throw new Error('El límite debe ser mayor a 0');
    }

    if (params.limit > 100) {
      throw new Error('El límite no puede ser mayor a 100');
    }

    if (params.sortBy) {
      const validSortFields = [
        'id', 'name', 'code', 'location', 'status',
        'latitude', 'longitude', 'current_level',
        'threshold', 'last_measurement', 'created_at', 'updated_at'
      ];

      if (!validSortFields.includes(params.sortBy)) {
        throw new Error(`Campo de ordenamiento inválido: ${params.sortBy}`);
      }
    }

    if (params.sortOrder && !['asc', 'desc'].includes(params.sortOrder)) {
      throw new Error('El orden debe ser "asc" o "desc"');
    }
  }

  private validateFilters(filters: StationFilters): void {
    if (filters.status && !['active', 'inactive', 'maintenance'].includes(filters.status)) {
      throw new Error('Estado de filtro inválido');
    }

    if (filters.latitude) {
      if (filters.latitude.min !== undefined && (filters.latitude.min < -90 || filters.latitude.min > 90)) {
        throw new Error('Latitud mínima debe estar entre -90 y 90');
      }
      if (filters.latitude.max !== undefined && (filters.latitude.max < -90 || filters.latitude.max > 90)) {
        throw new Error('Latitud máxima debe estar entre -90 y 90');
      }
      if (filters.latitude.min !== undefined && filters.latitude.max !== undefined &&
          filters.latitude.min > filters.latitude.max) {
        throw new Error('Latitud mínima no puede ser mayor que la máxima');
      }
    }

    if (filters.longitude) {
      if (filters.longitude.min !== undefined && (filters.longitude.min < -180 || filters.longitude.min > 180)) {
        throw new Error('Longitud mínima debe estar entre -180 y 180');
      }
      if (filters.longitude.max !== undefined && (filters.longitude.max < -180 || filters.longitude.max > 180)) {
        throw new Error('Longitud máxima debe estar entre -180 y 180');
      }
      if (filters.longitude.min !== undefined && filters.longitude.max !== undefined &&
          filters.longitude.min > filters.longitude.max) {
        throw new Error('Longitud mínima no puede ser mayor que la máxima');
      }
    }

    if (filters.threshold) {
      if (filters.threshold.min !== undefined && filters.threshold.min < 0) {
        throw new Error('Umbral mínimo debe ser positivo');
      }
      if (filters.threshold.max !== undefined && filters.threshold.max < 0) {
        throw new Error('Umbral máximo debe ser positivo');
      }
      if (filters.threshold.min !== undefined && filters.threshold.max !== undefined &&
          filters.threshold.min > filters.threshold.max) {
        throw new Error('Umbral mínimo no puede ser mayor que el máximo');
      }
    }

    if (filters.current_level) {
      if (filters.current_level.min !== undefined && filters.current_level.min < 0) {
        throw new Error('Nivel mínimo debe ser positivo');
      }
      if (filters.current_level.max !== undefined && filters.current_level.max < 0) {
        throw new Error('Nivel máximo debe ser positivo');
      }
      if (filters.current_level.min !== undefined && filters.current_level.max !== undefined &&
          filters.current_level.min > filters.current_level.max) {
        throw new Error('Nivel mínimo no puede ser mayor que el máximo');
      }
    }
  }
}