import { Station } from '../entities/Station';
import { PaginationParams, PaginatedResult, StationFilters } from '@shared/types/pagination';

export interface StationRepository {
  findAll(): Promise<Station[]>;
  findById(id: number): Promise<Station | null>;
  findPaginated(params: PaginationParams, filters?: StationFilters): Promise<PaginatedResult<Station>>;
  create(station: Omit<Station, 'id' | 'created_at' | 'updated_at'>): Promise<Station>;
  update(id: number, station: Partial<Station>): Promise<Station | null>;
  delete(id: number): Promise<boolean>;
}