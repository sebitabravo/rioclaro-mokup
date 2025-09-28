import { Alert, VariableModule } from '@domain/entities/Alert';
import { AlertRepository, VariableModuleRepository } from '@domain/repositories/AlertRepository';
import { ApiClient } from './ApiClient';

export class ApiAlertRepository implements AlertRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(activeOnly?: boolean): Promise<Alert[]> {
    let endpoint = '/api/alerts/';

    if (activeOnly !== undefined) {
      endpoint += `?active_only=${activeOnly}`;
    }

    return await this.apiClient.get<Alert[]>(endpoint);
  }

  async findById(id: number): Promise<Alert | null> {
    try {
      return await this.apiClient.get<Alert>(`/api/alerts/${id}/`);
    } catch {
      return null;
    }
  }

  async create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    return await this.apiClient.post<Alert>('/api/alerts/', alert);
  }

  async resolve(id: number): Promise<Alert | null> {
    try {
      return await this.apiClient.patch<Alert>(`/api/alerts/${id}/resolve/`);
    } catch {
      return null;
    }
  }
}

export class ApiVariableModuleRepository implements VariableModuleRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<VariableModule[]> {
    return await this.apiClient.get<VariableModule[]>('/api/variable-modules/');
  }

  async findById(id: number): Promise<VariableModule | null> {
    try {
      return await this.apiClient.get<VariableModule>(`/api/variable-modules/${id}/`);
    } catch {
      return null;
    }
  }

  async create(module: Omit<VariableModule, 'id' | 'created_at'>): Promise<VariableModule> {
    return await this.apiClient.post<VariableModule>('/api/variable-modules/', module);
  }

  async toggle(id: number, isActive: boolean): Promise<VariableModule | null> {
    try {
      return await this.apiClient.patch<VariableModule>(`/api/variable-modules/${id}/toggle/`, { is_active: isActive });
    } catch {
      return null;
    }
  }
}