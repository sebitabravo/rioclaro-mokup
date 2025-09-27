import { StationRepository } from '@domain/repositories/StationRepository';

export class DeleteStationUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(id: number): Promise<boolean> {
    if (!id || id <= 0) {
      throw new Error('ID de estación inválido');
    }

    const existingStation = await this.stationRepository.findById(id);
    if (!existingStation) {
      throw new Error(`No se encontró la estación con ID: ${id}`);
    }

    await this.validateDeletion(existingStation.id);

    const deleted = await this.stationRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar la estación');
    }

    return deleted;
  }

  private async validateDeletion(stationId: number): Promise<void> {
    const criticalStationIds = [1, 2];

    if (criticalStationIds.includes(stationId)) {
      throw new Error('No se puede eliminar una estación crítica del sistema');
    }
  }
}