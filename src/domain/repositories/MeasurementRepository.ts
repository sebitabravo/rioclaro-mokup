import { Measurement, MeasurementFilters } from '../entities/Measurement';

export interface MeasurementRepository {
  findLatest(stationId?: number): Promise<Measurement[]>;
  findHistorical(filters: MeasurementFilters): Promise<Measurement[]>;
  create(measurement: Omit<Measurement, 'id'>): Promise<Measurement>;
}