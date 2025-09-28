import { AlertConfigurationRepository } from '@domain/repositories/AlertRepository';
import { AlertConfiguration, CreateAlertConfigurationData, UpdateAlertConfigurationData } from '@domain/entities/Alert';

export class GetAlertConfigurationsUseCase {
  constructor(private alertConfigRepository: AlertConfigurationRepository) {}

  async execute(): Promise<AlertConfiguration[]> {
    return await this.alertConfigRepository.findAll();
  }
}

export class GetAlertConfigurationsByStationUseCase {
  constructor(private alertConfigRepository: AlertConfigurationRepository) {}

  async execute(stationId: number): Promise<AlertConfiguration[]> {
    return await this.alertConfigRepository.findByStationId(stationId);
  }
}

export class GetAlertConfigurationByIdUseCase {
  constructor(private alertConfigRepository: AlertConfigurationRepository) {}

  async execute(id: number): Promise<AlertConfiguration | null> {
    return await this.alertConfigRepository.findById(id);
  }
}

export class GetAlertConfigurationBySensorUseCase {
  constructor(private alertConfigRepository: AlertConfigurationRepository) {}

  async execute(stationId: number, sensorType: string): Promise<AlertConfiguration | null> {
    return await this.alertConfigRepository.findBySensorType(stationId, sensorType);
  }
}

export class CreateAlertConfigurationUseCase {
  constructor(private alertConfigRepository: AlertConfigurationRepository) {}

  async execute(data: CreateAlertConfigurationData): Promise<AlertConfiguration> {
    // Validaciones de negocio
    if (!data.station_id || data.station_id <= 0) {
      throw new Error('ID de estación requerido y debe ser mayor a 0');
    }

    if (!data.sensor_type || data.sensor_type.trim() === '') {
      throw new Error('Tipo de sensor requerido');
    }

    if (!data.thresholds || data.thresholds.length === 0) {
      throw new Error('Al menos un umbral es requerido');
    }

    // Validar que no haya umbrales duplicados del mismo nivel
    const levels = data.thresholds.map(t => t.level);
    const uniqueLevels = new Set(levels);
    if (levels.length !== uniqueLevels.size) {
      throw new Error('No se pueden duplicar niveles de umbral');
    }

    // Validar que los rangos sean lógicos
    for (const threshold of data.thresholds) {
      if (threshold.min_value !== undefined && threshold.max_value !== undefined) {
        if (threshold.min_value >= threshold.max_value) {
          throw new Error(`Valor mínimo debe ser menor al máximo para el nivel ${threshold.level}`);
        }
      }

      if (threshold.persistence_time !== undefined && threshold.persistence_time < 0) {
        throw new Error('Tiempo de persistencia debe ser mayor o igual a 0');
      }
    }

    // Verificar que no exista ya una configuración para esta estación y sensor
    const existing = await this.alertConfigRepository.findBySensorType(data.station_id, data.sensor_type);
    if (existing) {
      throw new Error(`Ya existe una configuración para el sensor ${data.sensor_type} en esta estación`);
    }

    return await this.alertConfigRepository.create(data);
  }
}

export class UpdateAlertConfigurationUseCase {
  constructor(private alertConfigRepository: AlertConfigurationRepository) {}

  async execute(id: number, data: UpdateAlertConfigurationData): Promise<AlertConfiguration | null> {
    if (id <= 0) {
      throw new Error('ID de configuración inválido');
    }

    // Verificar que la configuración existe
    const existing = await this.alertConfigRepository.findById(id);
    if (!existing) {
      throw new Error('Configuración de alerta no encontrada');
    }

    // Validar umbrales si se proporcionan
    if (data.thresholds && data.thresholds.length > 0) {
      const levels = data.thresholds.map(t => t.level);
      const uniqueLevels = new Set(levels);
      if (levels.length !== uniqueLevels.size) {
        throw new Error('No se pueden duplicar niveles de umbral');
      }

      for (const threshold of data.thresholds) {
        if (threshold.min_value !== undefined && threshold.max_value !== undefined) {
          if (threshold.min_value >= threshold.max_value) {
            throw new Error(`Valor mínimo debe ser menor al máximo para el nivel ${threshold.level}`);
          }
        }

        if (threshold.persistence_time !== undefined && threshold.persistence_time < 0) {
          throw new Error('Tiempo de persistencia debe ser mayor o igual a 0');
        }
      }
    }

    return await this.alertConfigRepository.update(id, data);
  }
}

export class DeleteAlertConfigurationUseCase {
  constructor(private alertConfigRepository: AlertConfigurationRepository) {}

  async execute(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('ID de configuración inválido');
    }

    // Verificar que la configuración existe
    const existing = await this.alertConfigRepository.findById(id);
    if (!existing) {
      throw new Error('Configuración de alerta no encontrada');
    }

    return await this.alertConfigRepository.delete(id);
  }
}