import { Alert, VariableModule } from '@domain/entities/Alert';
import { AlertRepository, VariableModuleRepository } from '@domain/repositories/AlertRepository';
import { mockAlerts, mockVariableModules } from './MockDataRepository';

export class MockAlertRepository implements AlertRepository {
  private alerts: Alert[] = [...mockAlerts];

  async findAll(activeOnly?: boolean): Promise<Alert[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...this.alerts];
    
    if (activeOnly) {
      filtered = filtered.filter(alert => alert.is_active);
    }
    
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async findById(id: number): Promise<Alert | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.alerts.find(alert => alert.id === id) || null;
  }

  async create(alertData: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newAlert: Alert = {
      ...alertData,
      id: Math.max(...this.alerts.map(a => a.id)) + 1,
      created_at: new Date().toISOString(),
    };
    
    this.alerts.push(newAlert);
    return newAlert;
  }

  async resolve(id: number): Promise<Alert | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.alerts.findIndex(alert => alert.id === id);
    if (index === -1) return null;
    
    this.alerts[index] = {
      ...this.alerts[index],
      is_active: false,
      resolved_at: new Date().toISOString(),
    };
    
    return this.alerts[index];
  }
}

export class MockVariableModuleRepository implements VariableModuleRepository {
  private modules: VariableModule[] = [...mockVariableModules];

  async findAll(): Promise<VariableModule[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.modules];
  }

  async findById(id: number): Promise<VariableModule | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.modules.find(module => module.id === id) || null;
  }

  async create(moduleData: Omit<VariableModule, 'id' | 'created_at'>): Promise<VariableModule> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newModule: VariableModule = {
      ...moduleData,
      id: Math.max(...this.modules.map(m => m.id)) + 1,
      created_at: new Date().toISOString(),
    };
    
    this.modules.push(newModule);
    return newModule;
  }

  async toggle(id: number, isActive: boolean): Promise<VariableModule | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.modules.findIndex(module => module.id === id);
    if (index === -1) return null;
    
    this.modules[index] = {
      ...this.modules[index],
      is_active: isActive,
    };
    
    return this.modules[index];
  }
}