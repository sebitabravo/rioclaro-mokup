import { Measurement, MeasurementFilters } from '@domain/entities/Measurement';
import { MeasurementRepository } from '@domain/repositories/MeasurementRepository';

export class GetLatestMeasurementsUseCase {
  constructor(private measurementRepository: MeasurementRepository) {}

  async execute(stationId?: number): Promise<Measurement[]> {
    return await this.measurementRepository.findLatest(stationId);
  }
}

export class GetHistoricalMeasurementsUseCase {
  constructor(private measurementRepository: MeasurementRepository) {}

  async execute(filters: MeasurementFilters): Promise<Measurement[]> {
    if (filters.start_date && filters.end_date) {
      const startDate = new Date(filters.start_date);
      const endDate = new Date(filters.end_date);
      
      if (startDate > endDate) {
        throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }
    
    return await this.measurementRepository.findHistorical(filters);
  }
}