import type { ActivityLog, ActivityLogFilter } from '@domain/entities/ActivityLog';
import type { ActivityLogRepository } from '@domain/repositories/ActivityLogRepository';
import type { ApiClient } from './ApiClient';

export class ApiActivityLogRepository implements ActivityLogRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(filter?: ActivityLogFilter): Promise<ActivityLog[]> {
    try {
      // Construir query params si hay filtros
      const queryParams = filter ? new URLSearchParams(Object.entries(filter).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
      const endpoint = queryParams ? `/activity-logs/?${queryParams}` : '/activity-logs/';
      const response = await this.apiClient.get<ActivityLog[]>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }
  }

  async findById(id: number): Promise<ActivityLog | null> {
    try {
      const response = await this.apiClient.get<ActivityLog>(`/activity-logs/${id}/`);
      return response;
    } catch (error) {
      console.error('Error fetching activity log:', error);
      return null;
    }
  }

  async create(activityData: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
    try {
      const response = await this.apiClient.post<ActivityLog>('/activity-logs/', activityData);
      return response;
    } catch (error) {
      console.error('Error creating activity log:', error);
      throw error;
    }
  }

  async deleteById(id: number): Promise<boolean> {
    try {
      await this.apiClient.delete(`/activity-logs/${id}/`);
      return true;
    } catch (error) {
      console.error('Error deleting activity log:', error);
      return false;
    }
  }

  async deleteOld(daysToKeep: number): Promise<number> {
    try {
      const response = await this.apiClient.delete<{deleted_count: number}>(`/activity-logs/cleanup/?days=${daysToKeep}`);
      return response.deleted_count || 0;
    } catch (error) {
      console.error('Error deleting old activity logs:', error);
      return 0;
    }
  }

  async getStats(filter?: ActivityLogFilter): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentActivity: ActivityLog[];
  }> {
    try {
      // Construir query params si hay filtros
      const queryParams = filter ? new URLSearchParams(Object.entries(filter).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
      const endpoint = queryParams ? `/activity-logs/stats/?${queryParams}` : '/activity-logs/stats/';
      const response = await this.apiClient.get<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        recentActivity: ActivityLog[];
      }>(endpoint);
      return response;
    } catch (error) {
      console.error('Error fetching activity log stats:', error);
      return {
        total: 0,
        byType: {},
        byStatus: {},
        recentActivity: []
      };
    }
  }
}