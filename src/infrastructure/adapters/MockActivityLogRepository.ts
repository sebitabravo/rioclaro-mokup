import { ActivityLog, ActivityLogFilter } from '@domain/entities/ActivityLog';
import { ActivityLogRepository } from '@domain/repositories/ActivityLogRepository';

// Datos mock para logs de actividad
const mockActivityLogs: ActivityLog[] = [
  {
    id: 1,
    timestamp: '2025-08-27T14:30:00Z',
    user_id: 1,
    user_name: 'María González',
    activity_type: 'report_generated',
    title: 'Reporte diario generado',
    description: 'Se generó automáticamente el reporte diario del Río Claro',
    status: 'success',
    station_id: 1,
    station_name: 'Estación Río Claro Norte',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    metadata: { report_type: 'daily', format: 'PDF' },
    created_at: '2025-08-27T14:30:00Z'
  },
  {
    id: 2,
    timestamp: '2025-08-27T14:15:00Z',
    user_id: 2,
    user_name: 'Carlos Martínez',
    activity_type: 'alert_triggered',
    title: 'Alerta de nivel crítico',
    description: 'Se activó alerta por nivel de agua superior al umbral crítico',
    status: 'warning',
    station_id: 3,
    station_name: 'Estación Río Claro Sur',
    ip_address: '192.168.1.105',
    metadata: { level: 3.2, threshold: 3.0, alert_id: 15 },
    created_at: '2025-08-27T14:15:00Z'
  },
  {
    id: 3,
    timestamp: '2025-08-27T13:45:00Z',
    user_id: 1,
    user_name: 'María González',
    activity_type: 'station_updated',
    title: 'Configuración de estación actualizada',
    description: 'Se actualizó el umbral de alerta para la estación centro',
    status: 'success',
    station_id: 2,
    station_name: 'Estación Río Claro Centro',
    ip_address: '192.168.1.100',
    metadata: { old_threshold: 2.3, new_threshold: 2.5 },
    created_at: '2025-08-27T13:45:00Z'
  },
  {
    id: 4,
    timestamp: '2025-08-27T13:30:00Z',
    user_id: 3,
    user_name: 'Ana López',
    activity_type: 'user_login',
    title: 'Inicio de sesión',
    description: 'Usuario ingresó al sistema',
    status: 'info',
    ip_address: '192.168.1.110',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    created_at: '2025-08-27T13:30:00Z'
  },
  {
    id: 5,
    timestamp: '2025-08-27T12:00:00Z',
    activity_type: 'measurement_recorded',
    title: 'Medición automática registrada',
    description: 'Se registró nueva medición de nivel de agua',
    status: 'success',
    station_id: 1,
    station_name: 'Estación Río Claro Norte',
    metadata: { water_level: 2.45, flow_rate: 14.2 },
    created_at: '2025-08-27T12:00:00Z'
  },
  {
    id: 6,
    timestamp: '2025-08-27T11:30:00Z',
    user_id: 2,
    user_name: 'Carlos Martínez',
    activity_type: 'report_downloaded',
    title: 'Reporte descargado',
    description: 'Se descargó el informe semanal de nivel y riesgo hídrico',
    status: 'success',
    ip_address: '192.168.1.105',
    metadata: { report_id: 'weekly_2025_34', format: 'PDF' },
    created_at: '2025-08-27T11:30:00Z'
  },
  {
    id: 7,
    timestamp: '2025-08-27T11:00:00Z',
    activity_type: 'system_maintenance',
    title: 'Mantenimiento del sistema',
    description: 'Se realizó mantenimiento programado de la base de datos',
    status: 'info',
    metadata: { duration_minutes: 15, affected_services: ['api', 'database'] },
    created_at: '2025-08-27T11:00:00Z'
  },
  {
    id: 8,
    timestamp: '2025-08-27T10:45:00Z',
    user_id: 1,
    user_name: 'María González',
    activity_type: 'alert_resolved',
    title: 'Alerta resuelta',
    description: 'Se marcó como resuelta la alerta de nivel crítico',
    status: 'success',
    station_id: 3,
    station_name: 'Estación Río Claro Sur',
    ip_address: '192.168.1.100',
    metadata: { alert_id: 14, resolution_time_minutes: 30 },
    created_at: '2025-08-27T10:45:00Z'
  },
  {
    id: 9,
    timestamp: '2025-08-27T09:30:00Z',
    user_id: 2,
    user_name: 'Carlos Martínez',
    activity_type: 'configuration_changed',
    title: 'Configuración modificada',
    description: 'Se actualizó la frecuencia de medición automática',
    status: 'warning',
    metadata: { old_frequency: 30, new_frequency: 15, unit: 'minutes' },
    created_at: '2025-08-27T09:30:00Z'
  },
  {
    id: 10,
    timestamp: '2025-08-27T08:00:00Z',
    activity_type: 'backup_created',
    title: 'Respaldo automático',
    description: 'Se creó respaldo automático del sistema',
    status: 'success',
    metadata: { backup_size_mb: 245, location: 'cloud_storage' },
    created_at: '2025-08-27T08:00:00Z'
  }
];

export class MockActivityLogRepository implements ActivityLogRepository {
  private logs: ActivityLog[] = [...mockActivityLogs];

  async findAll(filter?: ActivityLogFilter): Promise<ActivityLog[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!);
      }
      
      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!);
      }
      
      if (filter.activityTypes && filter.activityTypes.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.activityTypes!.includes(log.activity_type));
      }
      
      if (filter.status && filter.status.length > 0) {
        filteredLogs = filteredLogs.filter(log => filter.status!.includes(log.status));
      }
      
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.user_id === filter.userId);
      }
      
      if (filter.stationId) {
        filteredLogs = filteredLogs.filter(log => log.station_id === filter.stationId);
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log => 
          log.title.toLowerCase().includes(searchLower) ||
          log.description.toLowerCase().includes(searchLower) ||
          log.user_name?.toLowerCase().includes(searchLower) ||
          log.station_name?.toLowerCase().includes(searchLower)
        );
      }
    }

    // Ordenar por timestamp descendente (más reciente primero)
    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async findById(id: number): Promise<ActivityLog | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.logs.find(log => log.id === id) || null;
  }

  async create(activityData: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newLog: ActivityLog = {
      ...activityData,
      id: Math.max(...this.logs.map(l => l.id)) + 1,
      created_at: new Date().toISOString(),
    };
    
    this.logs.unshift(newLog); // Agregar al inicio para mantener orden cronológico
    return newLog;
  }

  async deleteById(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 250));

    const initialLength = this.logs.length;
    this.logs = this.logs.filter(log => log.id !== id);
    return this.logs.length < initialLength;
  }

  async deleteOld(daysToKeep: number): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const initialCount = this.logs.length;
    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoffDate);
    
    return initialCount - this.logs.length;
  }

  async getStats(filter?: ActivityLogFilter): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentActivity: ActivityLog[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const filteredLogs = await this.findAll(filter);
    
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    filteredLogs.forEach(log => {
      byType[log.activity_type] = (byType[log.activity_type] || 0) + 1;
      byStatus[log.status] = (byStatus[log.status] || 0) + 1;
    });
    
    return {
      total: filteredLogs.length,
      byType,
      byStatus,
      recentActivity: filteredLogs.slice(0, 5)
    };
  }
}
