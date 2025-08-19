import { Station } from '../entities/Station';

export interface StationRepository {
  findAll(): Promise<Station[]>;
  findById(id: number): Promise<Station | null>;
  create(station: Omit<Station, 'id' | 'created_at' | 'updated_at'>): Promise<Station>;
  update(id: number, station: Partial<Station>): Promise<Station | null>;
  delete(id: number): Promise<boolean>;
}