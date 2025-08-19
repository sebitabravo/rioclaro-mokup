import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';

export class GetStationsUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(): Promise<Station[]> {
    return await this.stationRepository.findAll();
  }
}

export class GetStationByIdUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(id: number): Promise<Station | null> {
    if (id <= 0) {
      throw new Error('ID de estación inválido');
    }
    return await this.stationRepository.findById(id);
  }
}