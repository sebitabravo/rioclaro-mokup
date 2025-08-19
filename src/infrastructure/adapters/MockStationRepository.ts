import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';
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