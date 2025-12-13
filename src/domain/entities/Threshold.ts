export interface Threshold {
  id: number;
  station_id: number;
  station_name?: string;
  measurement_type: string;
  measurement_type_display?: string;
  warning_min?: number;
  warning_max?: number;
  critical_min?: number;
  critical_max?: number;
  unit: string;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ThresholdFilters {
  station_id?: number;
  measurement_type?: string;
  is_active?: boolean;
}

export interface CreateThresholdData {
  station: number;
  measurement_type: string;
  warning_min?: number;
  warning_max?: number;
  critical_min?: number;
  critical_max?: number;
  unit: string;
  notes?: string;
}

export interface UpdateThresholdData extends Partial<CreateThresholdData> {
  is_active?: boolean;
}