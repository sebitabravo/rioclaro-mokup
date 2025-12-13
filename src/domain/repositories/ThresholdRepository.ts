import { Threshold, ThresholdFilters, CreateThresholdData, UpdateThresholdData } from '@domain/entities/Threshold';

export interface ThresholdRepository {
  findAll(filters?: ThresholdFilters): Promise<Threshold[]>;
  findById(id: number): Promise<Threshold | null>;
  create(data: CreateThresholdData): Promise<Threshold>;
  update(id: number, data: UpdateThresholdData): Promise<Threshold>;
  delete(id: number): Promise<void>;
}