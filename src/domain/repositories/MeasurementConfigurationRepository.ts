import { MeasurementConfiguration, MeasurementConfigurationFilters, CreateMeasurementConfigurationData, UpdateMeasurementConfigurationData } from '@domain/entities/MeasurementConfiguration';

export interface MeasurementConfigurationRepository {
  findAll(filters?: MeasurementConfigurationFilters): Promise<MeasurementConfiguration[]>;
  findById(id: number): Promise<MeasurementConfiguration | null>;
  findByStation(stationId: number): Promise<MeasurementConfiguration | null>;
  create(data: CreateMeasurementConfigurationData): Promise<MeasurementConfiguration>;
  update(id: number, data: UpdateMeasurementConfigurationData): Promise<MeasurementConfiguration>;
  delete(id: number): Promise<void>;
}