import { StationRepository } from '@domain/repositories/StationRepository';

export class DeleteStationUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(id: number): Promise<boolean> {
    // Validar que el ID sea válido
    if (!id || id <= 0) {
      throw new Error('ID de estación inválido');
    }

    // Verificar que la estación existe
    const existingStation = await this.stationRepository.findById(id);
    if (!existingStation) {
      throw new Error(`No se encontró la estación con ID: ${id}`);
    }

    // Validaciones de negocio antes de eliminar
    await this.validateDeletion(existingStation.id);

    // Eliminar la estación
    const deleted = await this.stationRepository.delete(id);

    if (!deleted) {
      throw new Error('Error al eliminar la estación');
    }

    return deleted;
  }

  private async validateDeletion(stationId: number): Promise<void> {
    // Aquí se pueden agregar validaciones adicionales como:
    // - Verificar si la estación tiene mediciones recientes
    // - Verificar si está siendo usada en alertas activas
    // - Verificar permisos del usuario para eliminar

    // Por ejemplo, podríamos verificar si la estación tiene mediciones muy recientes
    // que no deberían perderse

    // Si tuviéramos un MeasurementRepository, podríamos hacer algo como:
    // const recentMeasurements = await measurementRepository.findByStationIdAndDateRange(
    //   stationId,
    //   new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24 horas
    //   new Date()
    // );
    //
    // if (recentMeasurements.length > 0) {
    //   throw new Error('No se puede eliminar una estación con mediciones recientes');
    // }

    // Por ahora, solo validamos que no sea una estación crítica (esto es solo un ejemplo)
    // En un escenario real, esta información vendría del dominio o configuración
    const criticalStationIds = [1, 2]; // IDs de estaciones críticas

    if (criticalStationIds.includes(stationId)) {
      throw new Error('No se puede eliminar una estación crítica del sistema');
    }
  }
}