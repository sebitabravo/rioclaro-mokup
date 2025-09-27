// Tipos específicos para diferentes fuentes de datos de entrada

// ==========================================
// Base Raw Data Interface
// ==========================================
export interface BaseRawData {
  id?: string | number;
  [key: string]: unknown;
}

// ==========================================
// Measurement Data Types
// ==========================================
export interface MeasurementRawData extends BaseRawData {
  timestamp?: string;
  created_at?: string;
  date?: string;
  value?: number | string;
  water_level?: number | string;
  level?: number | string;
  station_name?: string;
  station?: string;
  station_id?: number | string;
}

// ==========================================
// Station Data Types
// ==========================================
export interface StationRawData extends BaseRawData {
  last_measurement?: string;
  updated_at?: string;
  current_level?: number | string;
  level?: number | string;
  value?: number | string;
  name?: string;
  station_name?: string;
  station_id?: number | string;
}

// ==========================================
// Alert Data Types
// ==========================================
export interface AlertRawData extends BaseRawData {
  created_at?: string;
  timestamp?: string;
  date?: string;
  level?: number | string;
  value?: number | string;
  threshold?: number | string;
  message?: string;
  description?: string;
  station_id?: number | string;
}

// ==========================================
// Report Data Types
// ==========================================
export interface ReportRawData extends BaseRawData {
  date?: string;
  timestamp?: string;
  created_at?: string;
  average_level?: number | string;
  max_level?: number | string;
  value?: number | string;
  period?: string;
  type?: string;
  station_id?: number | string;
}

// ==========================================
// API V1 Data Types
// ==========================================
export interface ApiV1RawData extends BaseRawData {
  time?: string;
  date?: string;
  timestamp?: string;
  level?: number | string;
  measurement?: number | string;
  data?: number | string;
  location?: string;
  name?: string;
  sensor_id?: number | string;
}

// ==========================================
// API V2 Data Types
// ==========================================
export interface ApiV2RawData extends BaseRawData {
  datetime?: string;
  timestamp?: string;
  recorded_at?: string;
  water_height?: number | string;
  height?: number | string;
  level?: number | string;
  sensor_name?: string;
  device?: string;
  device_id?: number | string;
  sensor_id?: number | string;
}

// ==========================================
// CSV Data Types
// ==========================================
export interface CsvRawData extends BaseRawData {
  fecha?: string;
  timestamp?: string;
  date?: string;
  time?: string;
  nivel?: number | string;
  level?: number | string;
  value?: number | string;
  medicion?: number | string;
  estacion?: string;
  station?: string;
  nombre?: string;
  station_id?: number | string;
}

// ==========================================
// JSON Data Types (Dynamic)
// ==========================================
export interface JsonRawData extends BaseRawData {
  [key: string]: unknown;
}

// ==========================================
// Union Types for Input Data
// ==========================================
export type RawDataInput =
  | MeasurementRawData
  | StationRawData
  | AlertRawData
  | ReportRawData
  | ApiV1RawData
  | ApiV2RawData
  | CsvRawData
  | JsonRawData;

// ==========================================
// Typed Arrays for Each Data Source
// ==========================================
export type MeasurementDataArray = MeasurementRawData[];
export type StationDataArray = StationRawData[];
export type AlertDataArray = AlertRawData[];
export type ReportDataArray = ReportRawData[];
export type ApiV1DataArray = ApiV1RawData[];
export type ApiV2DataArray = ApiV2RawData[];
export type CsvDataArray = CsvRawData[];
export type JsonDataArray = JsonRawData[];

// ==========================================
// Type Guards for Runtime Validation
// ==========================================

export const isString = (value: unknown): value is string =>
  typeof value === 'string';

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);

export const isStringOrNumber = (value: unknown): value is string | number =>
  isString(value) || isNumber(value);

export const parseToNumber = (value: unknown): number => {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const parseToString = (value: unknown): string => {
  if (isString(value)) return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

export const isValidTimestamp = (timestamp: unknown): timestamp is string => {
  return isString(timestamp) && !isNaN(Date.parse(timestamp));
};

export const parseToTimestamp = (value: unknown): string => {
  if (isValidTimestamp(value)) return value;
  if (isStringOrNumber(value)) {
    const dateStr = String(value);
    if (!isNaN(Date.parse(dateStr))) return dateStr;
  }
  return new Date().toISOString();
};

// ==========================================
// Error Types for Data Normalization
// ==========================================
export class DataNormalizationError extends Error {
  constructor(
    message: string,
    public sourceType: string,
    public originalData?: unknown
  ) {
    super(message);
    this.name = 'DataNormalizationError';
  }
}

export class InvalidDataFormatError extends DataNormalizationError {
  constructor(sourceType: string, expectedFormat: string, receivedData?: unknown) {
    super(
      `Invalid data format for ${sourceType}. Expected: ${expectedFormat}`,
      sourceType,
      receivedData
    );
    this.name = 'InvalidDataFormatError';
  }
}