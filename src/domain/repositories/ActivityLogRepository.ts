import { ActivityLog, ActivityLogFilter } from '@domain/entities/ActivityLog';

export interface ActivityLogRepository {
  findAll(filter?: ActivityLogFilter): Promise<ActivityLog[]>;
  findById(id: number): Promise<ActivityLog | null>;
  create(activityData: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog>;
  deleteById(id: number): Promise<boolean>;
  deleteOld(daysToKeep: number): Promise<number>; // Retorna número de registros eliminados
  getStats(filter?: ActivityLogFilter): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentActivity: ActivityLog[];
  }>;
}
