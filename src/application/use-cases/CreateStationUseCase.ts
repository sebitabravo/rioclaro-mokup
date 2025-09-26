import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';

export interface CreateStationData {
  name: string;
  code: string;
  location: string;
  latitude: number;
  longitude: number;
  threshold: number;
  current_level: number;
  status: 'active' | 'inactive' | 'maintenance';
  last_measurement: string;
}

export class CreateStationUseCase {
  constructor(private stationRepository: StationRepository) {}

  async execute(stationData: CreateStationData): Promise<Station> {
    // Validaciones de negocio
    this.validateStationData(stationData);

    // Verificar que el código de la estación sea único
    const existingStations = await this.stationRepository.findAll();
    const codeExists = existingStations.some(station => station.code === stationData.code);

    if (codeExists) {
      throw new Error(`Ya existe una estación con el código: ${stationData.code}`);
    }

    // Verificar coordenadas válidas
    if (stationData.latitude < -90 || stationData.latitude > 90) {
      throw new Error('La latitud debe estar entre -90 y 90 grados');
    }

    if (stationData.longitude < -180 || stationData.longitude > 180) {
      throw new Error('La longitud debe estar entre -180 y 180 grados');
    }

    // Verificar que el threshold sea positivo
    if (stationData.threshold <= 0) {
      throw new Error('El umbral debe ser un valor positivo');
    }

    // Crear la estación
    const stationToCreate = {
      ...stationData,
      name: stationData.name.trim(),
      code: stationData.code.trim().toUpperCase(),
      location: stationData.location.trim(),
    };

    return await this.stationRepository.create(stationToCreate);
  }

  private validateStationData(stationData: CreateStationData): void {
    if (!stationData.name?.trim()) {
      throw new Error('El nombre de la estación es requerido');
    }

    if (!stationData.code?.trim()) {
      throw new Error('El código de la estación es requerido');
    }

    if (!stationData.location?.trim()) {
      throw new Error('La ubicación de la estación es requerida');
    }

    if (stationData.name.length < 3) {
      throw new Error('El nombre de la estación debe tener al menos 3 caracteres');
    }

    if (stationData.code.length < 2) {
      throw new Error('El código de la estación debe tener al menos 2 caracteres');
    }

    const validStatuses = ['active', 'inactive', 'maintenance'];
    if (!validStatuses.includes(stationData.status)) {
      throw new Error('El estado de la estación debe ser: active, inactive o maintenance');
    }
  }
}