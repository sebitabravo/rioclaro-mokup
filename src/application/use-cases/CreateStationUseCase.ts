import { Station } from '@domain/entities/Station';
import { StationRepository } from '@domain/repositories/StationRepository';
import {
  EntityAlreadyExistsError,
  InvalidCoordinatesError,
  InvalidThresholdError,
  ValidationError,
  ValidationFieldError
} from '@shared/types/errors';

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
    // Validaciones de entrada con errores tipados
    this.validateStationData(stationData);

    // Verificar que el código de la estación sea único
    const existingStations = await this.stationRepository.findAll();
    const codeExists = existingStations.some(station => station.code === stationData.code.trim().toUpperCase());

    if (codeExists) {
      throw new EntityAlreadyExistsError(
        'Estación',
        'código',
        stationData.code,
        { attemptedCode: stationData.code }
      );
    }

    // Validar coordenadas con errores específicos
    this.validateCoordinates(stationData.latitude, stationData.longitude);

    // Validar umbral con error específico
    this.validateThreshold(stationData.threshold);

    // Crear la estación con datos normalizados
    const stationToCreate = {
      ...stationData,
      name: stationData.name.trim(),
      code: stationData.code.trim().toUpperCase(),
      location: stationData.location.trim(),
    };

    try {
      return await this.stationRepository.create(stationToCreate);
    } catch (error) {
      // Si hay un error en el repositorio, lo re-lanzamos con contexto
      throw error; // El repositorio debe manejar sus propios errores tipados
    }
  }

  private validateStationData(stationData: CreateStationData): void {
    const errors: ValidationFieldError[] = [];

    // Validar nombre
    if (!stationData.name?.trim()) {
      errors.push({
        field: 'name',
        value: stationData.name,
        message: 'El nombre de la estación es requerido',
        code: 'REQUIRED'
      });
    } else if (stationData.name.trim().length < 3) {
      errors.push({
        field: 'name',
        value: stationData.name,
        message: 'El nombre de la estación debe tener al menos 3 caracteres',
        code: 'MIN_LENGTH'
      });
    }

    // Validar código
    if (!stationData.code?.trim()) {
      errors.push({
        field: 'code',
        value: stationData.code,
        message: 'El código de la estación es requerido',
        code: 'REQUIRED'
      });
    } else if (stationData.code.trim().length < 2) {
      errors.push({
        field: 'code',
        value: stationData.code,
        message: 'El código de la estación debe tener al menos 2 caracteres',
        code: 'MIN_LENGTH'
      });
    }

    // Validar ubicación
    if (!stationData.location?.trim()) {
      errors.push({
        field: 'location',
        value: stationData.location,
        message: 'La ubicación de la estación es requerida',
        code: 'REQUIRED'
      });
    }

    // Validar estado
    const validStatuses = ['active', 'inactive', 'maintenance'] as const;
    if (!validStatuses.includes(stationData.status)) {
      errors.push({
        field: 'status',
        value: stationData.status,
        message: 'El estado de la estación debe ser: active, inactive o maintenance',
        code: 'INVALID_VALUE'
      });
    }

    // Si hay errores, lanzar ValidationError
    if (errors.length > 0) {
      throw new ValidationError(errors, {
        useCase: 'CreateStation',
        operation: 'validateStationData'
      });
    }
  }

  /**
   * Valida las coordenadas geográficas
   */
  private validateCoordinates(latitude: number, longitude: number): void {
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new InvalidCoordinatesError(latitude, longitude, {
        validLatitudeRange: { min: -90, max: 90 },
        validLongitudeRange: { min: -180, max: 180 }
      });
    }
  }

  /**
   * Valida el umbral de la estación
   */
  private validateThreshold(threshold: number): void {
    if (threshold <= 0) {
      throw new InvalidThresholdError(threshold, {
        minimum: 0,
        message: 'El umbral debe ser mayor que cero'
      });
    }
  }
}