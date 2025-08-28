// Common data item structure that can be normalized
export interface DataItem {
  timestamp?: string;
  date?: string;
  time?: string;
  datetime?: string;
  value?: number | string;
  level?: number | string;
  flow?: number | string;
  flow_rate?: number | string;
  velocity?: number | string;
  temperature?: number | string;
  station_id?: number | string;
  station_name?: string;
  id?: number | string;
  [key: string]: unknown;
}

// For measurements data
export interface MeasurementData extends DataItem {
  measurement_type?: string;
  metric_type?: string;
}

// For station data
export interface StationData extends DataItem {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

// For alert data  
export interface AlertData extends DataItem {
  severity?: string;
  message?: string;
  resolved?: boolean;
}

// For report data
export interface ReportData extends DataItem {
  report_type?: string;
  generated_by?: string;
  file_path?: string;
}

// Union type for all possible data structures
export type NormalizableData = DataItem | MeasurementData | StationData | AlertData | ReportData;