import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';

export interface UpdateStationData {
  name?: string;
  code?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  threshold?: number;
  current_level?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  last_measurement?: string;
}

export class UpdateStationUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(id: number, stationData: UpdateStationData): Promise<Station> {
    // Verificar que la estación existe
    const existingStation = await this.stationRepository.findById(id);
    if (!existingStation) {
      throw new Error(`No se encontró la estación con ID: ${id}`);
    }

    // Validaciones de negocio para los campos que se van a actualizar
    this.validateUpdateData(stationData);

    // Si se está actualizando el código, verificar que sea único
    if (stationData.code && stationData.code !== existingStation.code) {
      const allStations = await this.stationRepository.findAll();
      const codeExists = allStations.some(station =>
        station.id !== id && station.code === stationData.code?.trim().toUpperCase()
      );

      if (codeExists) {
        throw new Error(`Ya existe una estación con el código: ${stationData.code}`);
      }
    }

    // Validar coordenadas si se están actualizando
    if (stationData.latitude !== undefined) {
      if (stationData.latitude < -90 || stationData.latitude > 90) {
        throw new Error('La latitud debe estar entre -90 y 90 grados');
      }
    }

    if (stationData.longitude !== undefined) {
      if (stationData.longitude < -180 || stationData.longitude > 180) {
        throw new Error('La longitud debe estar entre -180 y 180 grados');
      }
    }

    // Validar threshold si se está actualizando
    if (stationData.threshold !== undefined && stationData.threshold <= 0) {
      throw new Error('El umbral debe ser un valor positivo');
    }

    // Preparar datos para actualización
    const updateData: UpdateStationData = { ...stationData };

    if (updateData.name) {
      updateData.name = updateData.name.trim();
    }

    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }

    if (updateData.location) {
      updateData.location = updateData.location.trim();
    }

    // Actualizar la estación
    const updatedStation = await this.stationRepository.update(id, updateData);

    if (!updatedStation) {
      throw new Error('Error al actualizar la estación');
    }

    return updatedStation;
  }

  private validateUpdateData(stationData: UpdateStationData): void {
    if (stationData.name !== undefined) {
      if (!stationData.name?.trim()) {
        throw new Error('El nombre de la estación no puede estar vacío');
      }
      if (stationData.name.length < 3) {
        throw new Error('El nombre de la estación debe tener al menos 3 caracteres');
      }
    }

    if (stationData.code !== undefined) {
      if (!stationData.code?.trim()) {
        throw new Error('El código de la estación no puede estar vacío');
      }
      if (stationData.code.length < 2) {
        throw new Error('El código de la estación debe tener al menos 2 caracteres');
      }
    }

    if (stationData.location !== undefined) {
      if (!stationData.location?.trim()) {
        throw new Error('La ubicación de la estación no puede estar vacía');
      }
    }

    if (stationData.status !== undefined) {
      const validStatuses = ['active', 'inactive', 'maintenance'];
      if (!validStatuses.includes(stationData.status)) {
        throw new Error('El estado de la estación debe ser: active, inactive o maintenance');
      }
    }

    // Validar que al menos un campo esté siendo actualizado
    const hasUpdates = Object.keys(stationData).some(key =>
      stationData[key as keyof UpdateStationData] !== undefined
    );

    if (!hasUpdates) {
      throw new Error('Debe proporcionar al menos un campo para actualizar');
    }
  }
}