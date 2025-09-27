// Tipos específicos para exportación de datos con type safety completo

import type { ActivityLog } from '@domain/entities/ActivityLog';

// ==========================================
// Core Export Types
// ==========================================

export type ExportFormat = 'excel' | 'csv' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  filename?: string;
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

// ==========================================
// Activity Type Mappings (Type-Safe)
// ==========================================

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

export type StatusType = 'success' | 'warning' | 'error' | 'info';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  user_login: 'Inicio de sesión',
  user_logout: 'Cierre de sesión',
  station_created: 'Estación creada',
  station_updated: 'Estación actualizada',
  station_deleted: 'Estación eliminada',
  measurement_recorded: 'Medición registrada',
  alert_triggered: 'Alerta activada',
  alert_resolved: 'Alerta resuelta',
  report_generated: 'Reporte generado',
  report_downloaded: 'Reporte descargado',
  system_maintenance: 'Mantenimiento del sistema',
  data_export: 'Exportación de datos',
  configuration_changed: 'Configuración modificada',
  backup_created: 'Respaldo creado',
  threshold_updated: 'Umbral actualizado'
} as const;

export const STATUS_LABELS: Record<StatusType, string> = {
  success: 'Exitoso',
  warning: 'Advertencia',
  error: 'Error',
  info: 'Información'
} as const;

// ==========================================
// Export Data Structures (Type-Safe)
// ==========================================

export interface BaseExportRow {
  'Fecha y Hora': string;
  'Tipo de Actividad': string;
  'Título': string;
  'Descripción': string;
  'Estado': string;
  'Usuario': string;
  'Estación': string;
  'Dirección IP': string;
}

export interface ExcelExportRow extends BaseExportRow {
  'Metadata'?: string;
}

export type CSVExportRow = BaseExportRow;

export interface PDFTableRow {
  timestamp: string;
  activityType: string;
  title: string;
  status: string;
  user: string;
  station: string;
}

// ==========================================
// Summary Data Types
// ==========================================

export interface SummaryDataItem {
  Tipo: string;
  Cantidad: number;
}

export interface ActivityStatistics {
  totalActivities: number;
  byStatus: Record<StatusType, number>;
  byType: Record<string, number>;
  topActivities: Array<{ type: string; label: string; count: number }>;
}

// ==========================================
// PDF Styling Types
// ==========================================

export interface PDFColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
}

export const PDF_COLORS: PDFColorScheme = {
  primary: '#1e40af',     // gov-blue
  secondary: '#6b7280',   // gov-gray
  accent: '#059669',      // gov-green
  text: '#1f2937',        // gov-dark
  muted: '#9ca3af'        // light gray
} as const;

export interface PDFPageInfo {
  pageNumber: number;
  pageCount?: number;
  currentY?: number;
}

// ==========================================
// File Generation Types
// ==========================================

export interface FileGenerationResult {
  success: boolean;
  filename: string;
  size?: number;
  error?: string;
}

export interface DownloadOptions {
  filename: string;
  mimeType: string;
  encoding?: string;
}

// ==========================================
// Error Types for Export Operations
// ==========================================

export class ExportError extends Error {
  constructor(
    message: string,
    public format: ExportFormat,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ExportError';
  }
}

export class DataValidationError extends ExportError {
  constructor(
    message: string,
    format: ExportFormat,
    public invalidData?: unknown
  ) {
    super(message, format);
    this.name = 'DataValidationError';
  }
}

// ==========================================
// Type Guards and Validators
// ==========================================

export const isValidActivityType = (type: string): type is ActivityType => {
  return Object.keys(ACTIVITY_TYPE_LABELS).includes(type as ActivityType);
};

export const isValidStatusType = (status: string): status is StatusType => {
  return Object.keys(STATUS_LABELS).includes(status as StatusType);
};

export const validateActivityLog = (log: unknown): log is ActivityLog => {
  if (!log || typeof log !== 'object') return false;

  const activityLog = log as Record<string, unknown>;

  return (
    typeof activityLog.id === 'number' &&
    typeof activityLog.timestamp === 'string' &&
    typeof activityLog.activity_type === 'string' &&
    typeof activityLog.title === 'string' &&
    typeof activityLog.status === 'string'
  );
};

// ==========================================
// Utility Functions for Type-Safe Operations
// ==========================================

export const getActivityTypeLabel = (type: string): string => {
  return isValidActivityType(type) ? ACTIVITY_TYPE_LABELS[type] : type;
};

export const getStatusLabel = (status: string): string => {
  return isValidStatusType(status) ? STATUS_LABELS[status] : status;
};

export const sanitizeForCSV = (value: string): string => {
  return `"${value.replace(/"/g, '""')}"`;
};

export const formatExportTimestamp = (timestamp: string): string => {
  try {
    return new Date(timestamp).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return timestamp;
  }
};

// ==========================================
// Constants for Export Configuration
// ==========================================

export const EXCEL_COLUMN_WIDTHS = {
  timestamp: 20,
  activityType: 25,
  title: 30,
  description: 50,
  status: 12,
  user: 20,
  station: 25,
  ip: 15,
  metadata: 30
} as const;

export const PDF_COLUMN_WIDTHS = {
  timestamp: 35,
  activityType: 35,
  title: 50,
  status: 20,
  user: 25,
  station: 25
} as const;

export const FILE_EXTENSIONS: Record<ExportFormat, string> = {
  excel: 'xlsx',
  csv: 'csv',
  pdf: 'pdf'
} as const;