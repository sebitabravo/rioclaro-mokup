export interface MeasurementConfiguration {
  id: number;
  station_id: number;
  station_name?: string;
  measurement_interval_minutes: number;
  data_retention_days: number;
  auto_alerts_enabled: boolean;
  notification_email?: string;
  created_at: string;
  updated_at: string;
}

export interface MeasurementConfigurationFilters {
  station_id?: number;
}

export interface CreateMeasurementConfigurationData {
  station: number;
  measurement_interval_minutes?: number;
  data_retention_days?: number;
  auto_alerts_enabled?: boolean;
  notification_email?: string;
}

export interface UpdateMeasurementConfigurationData extends Partial<CreateMeasurementConfigurationData> {}