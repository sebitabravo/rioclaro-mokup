export interface Measurement {
  id: number;
  station_id: number;
  station_name?: string;
  variable_type: string;
  value: number;
  unit: string;
  timestamp: string;
  is_critical: boolean;
  quality?: 'good' | 'fair' | 'poor';
}

export interface MeasurementFilters {
  station_id?: number;
  start_date?: string;
  end_date?: string;
  variable_type?: string;
}