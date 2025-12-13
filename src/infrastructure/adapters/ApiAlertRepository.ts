import { Alert, VariableModule } from '@domain/entities/Alert';
import { AlertRepository, VariableModuleRepository } from '@domain/repositories/AlertRepository';
import { ApiClient } from './ApiClient';

export class ApiAlertRepository implements AlertRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(activeOnly?: boolean): Promise<Alert[]> {
    let endpoint = '/api/measurements/alerts/';

    if (activeOnly !== undefined) {
      endpoint += `?active_only=${activeOnly}`;
    }

    return await this.apiClient.get<Alert[]>(endpoint);
  }

  async findById(id: number): Promise<Alert | null> {
    try {
      return await this.apiClient.get<Alert>(`/api/measurements/alerts/${id}/`);
    } catch {
      return null;
    }
  }

  async create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    return await this.apiClient.post<Alert>('/api/measurements/alerts/', alert);
  }

  async resolve(id: number): Promise<Alert | null> {
    try {
      return await this.apiClient.post<Alert>(`/api/measurements/alerts/${id}/action/`, { action: 'resolve' });
    } catch {
      return null;
    }
  }
}

export class ApiVariableModuleRepository implements VariableModuleRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<VariableModule[]> {
    return await this.apiClient.get<VariableModule[]>('/api/measurements/module4/dynamic-sensors/');
  }

  async findById(id: number): Promise<VariableModule | null> {
    try {
      return await this.apiClient.get<VariableModule>(`/api/measurements/module4/dynamic-sensors/${id}/`);
    } catch {
      return null;
    }
  }

  async create(module: Omit<VariableModule, 'id' | 'created_at'>): Promise<VariableModule> {
    return await this.apiClient.post<VariableModule>('/api/measurements/module4/dynamic-sensors/', module);
  }

  async toggle(id: number, isActive: boolean): Promise<VariableModule | null> {
    try {
      return await this.apiClient.post<VariableModule>(`/api/measurements/module4/dynamic-sensors/${id}/toggle_active/`, { is_active: isActive });
    } catch {
      return null;
    }
  }
}