export interface Alert {
  id: number;
  station_id: number;
  station_name?: string;
  variable_type: string;
  threshold_value: number;
  current_value: number;
  alert_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface AlertThreshold {
  id: number;
  level: 'warning' | 'critical' | 'emergency';
  min_value?: number;
  max_value?: number;
  tolerance?: number;
  persistence_time?: number; // en minutos
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertConfiguration {
  id: number;
  station_id: number;
  station_name?: string;
  sensor_type: string; // variable_type del sensor
  sensor_unit: string;
  is_active: boolean;
  thresholds: AlertThreshold[];
  created_at: string;
  updated_at: string;
}

export interface CreateAlertConfigurationData {
  station_id: number;
  sensor_type: string;
  is_active?: boolean;
  thresholds: Omit<AlertThreshold, 'id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateAlertConfigurationData {
  is_active?: boolean;
  thresholds?: (Omit<AlertThreshold, 'created_at' | 'updated_at'> | Omit<AlertThreshold, 'id' | 'created_at' | 'updated_at'>)[];
}

export interface VariableModule {
  id: number;
  name: string;
  variable_type: string;
  unit: string;
  description?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}