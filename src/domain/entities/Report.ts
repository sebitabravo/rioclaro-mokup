export interface DailyAverageData {
  date: string;
  station_name: string;
  average_value: number;
  min_value: number;
  max_value: number;
  measurement_count: number;
}

export interface CriticalEvent {
  id: number;
  station_name: string;
  water_level: number;
  threshold: number;
  timestamp: string;
  duration_minutes: number;
}

export interface ReportFilters {
  start_date: string;
  end_date: string;
  station_id?: number;
  variable_type?: string;
}

export type ReportType = 'daily-average' | 'critical-events' | 'comparative';
export type ExportFormat = 'csv' | 'pdf' | 'excel';