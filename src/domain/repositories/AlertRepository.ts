import { Alert, VariableModule } from '../entities/Alert';

import { AlertConfiguration, CreateAlertConfigurationData, UpdateAlertConfigurationData } from '@domain/entities/Alert';

export interface AlertRepository {
  findAll(activeOnly?: boolean): Promise<Alert[]>;
  findById(id: number): Promise<Alert | null>;
  create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert>;
  resolve(id: number): Promise<Alert | null>;
}

export interface AlertConfigurationRepository {
  findAll(): Promise<AlertConfiguration[]>;
  findByStationId(stationId: number): Promise<AlertConfiguration[]>;
  findById(id: number): Promise<AlertConfiguration | null>;
  findBySensorType(stationId: number, sensorType: string): Promise<AlertConfiguration | null>;
  create(data: CreateAlertConfigurationData): Promise<AlertConfiguration>;
  update(id: number, data: UpdateAlertConfigurationData): Promise<AlertConfiguration | null>;
  delete(id: number): Promise<boolean>;
}

export interface VariableModuleRepository {
  findAll(): Promise<VariableModule[]>;
  findById(id: number): Promise<VariableModule | null>;
  create(module: Omit<VariableModule, 'id' | 'created_at'>): Promise<VariableModule>;
  toggle(id: number, isActive: boolean): Promise<VariableModule | null>;
}