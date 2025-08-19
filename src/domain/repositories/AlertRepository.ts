import { Alert, VariableModule } from '../entities/Alert';

export interface AlertRepository {
  findAll(activeOnly?: boolean): Promise<Alert[]>;
  findById(id: number): Promise<Alert | null>;
  create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert>;
  resolve(id: number): Promise<Alert | null>;
}

export interface VariableModuleRepository {
  findAll(): Promise<VariableModule[]>;
  findById(id: number): Promise<VariableModule | null>;
  create(module: Omit<VariableModule, 'id' | 'created_at'>): Promise<VariableModule>;
  toggle(id: number, isActive: boolean): Promise<VariableModule | null>;
}