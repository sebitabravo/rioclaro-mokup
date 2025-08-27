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