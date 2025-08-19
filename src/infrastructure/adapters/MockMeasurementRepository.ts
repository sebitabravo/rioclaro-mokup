import { Measurement, MeasurementFilters } from '@domain/entities/Measurement';
import { MeasurementRepository } from '@domain/repositories/MeasurementRepository';
import { mockMeasurements } from './MockDataRepository';

export class MockMeasurementRepository implements MeasurementRepository {
  private measurements: Measurement[] = [...mockMeasurements];

  async findLatest(stationId?: number): Promise<Measurement[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...this.measurements];
    
    if (stationId) {
      filtered = filtered.filter(m => m.station === stationId);
    }
    
    // Ordenar por timestamp descendente y tomar los últimos 24
    return filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 24);
  }

  async findHistorical(filters: MeasurementFilters): Promise<Measurement[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...this.measurements];
    
    if (filters.station_id) {
      filtered = filtered.filter(m => m.station === filters.station_id);
    }
    
    if (filters.variable_type) {
      filtered = filtered.filter(m => m.variable_type === filters.variable_type);
    }
    
    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      filtered = filtered.filter(m => new Date(m.timestamp) >= startDate);
    }
    
    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      filtered = filtered.filter(m => new Date(m.timestamp) <= endDate);
    }
    
    return filtered.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async create(measurementData: Omit<Measurement, 'id'>): Promise<Measurement> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMeasurement: Measurement = {
      ...measurementData,
      id: Math.max(...this.measurements.map(m => m.id)) + 1,
    };
    
    this.measurements.push(newMeasurement);
    return newMeasurement;
  }
}