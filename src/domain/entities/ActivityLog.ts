export type ActivityType = 
  | 'user_login' 
  | 'user_logout'
  | 'station_created'
  | 'station_updated'
  | 'station_deleted'
  | 'measurement_recorded'
  | 'alert_triggered'
  | 'alert_resolved'
  | 'report_generated'
  | 'report_downloaded'
  | 'system_maintenance'
  | 'data_export'
  | 'configuration_changed'
  | 'backup_created'
  | 'threshold_updated';

export type ActivityStatus = 'success' | 'warning' | 'error' | 'info';

export interface ActivityLog {
  id: number;
  timestamp: string;
  user_id?: number;
  user_name?: string;
  activity_type: ActivityType;
  title: string;
  description: string;
  status: ActivityStatus;
  station_id?: number;
  station_name?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ActivityLogFilter {
  startDate?: string;
  endDate?: string;
  activityTypes?: ActivityType[];
  status?: ActivityStatus[];
  userId?: number;
  stationId?: number;
  search?: string;
}
