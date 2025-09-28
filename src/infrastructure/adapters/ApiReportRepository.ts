import { DailyAverageData, CriticalEvent, ReportFilters, ExportFormat } from '@domain/entities/Report';
import { ReportRepository } from '@domain/repositories/ReportRepository';
import { ApiClient } from './ApiClient';

export class ApiReportRepository implements ReportRepository {
  constructor(private apiClient: ApiClient) {}

  async getDailyAverage(filters: ReportFilters): Promise<DailyAverageData[]> {
    const queryParams = new URLSearchParams();

    if (filters.start_date) {
      queryParams.append('start_date', filters.start_date);
    }

    if (filters.end_date) {
      queryParams.append('end_date', filters.end_date);
    }

    if (filters.station_id) {
      queryParams.append('station_id', filters.station_id.toString());
    }

    if (filters.variable_type) {
      queryParams.append('variable_type', filters.variable_type);
    }

    const endpoint = queryParams.toString()
      ? `/api/reports/daily-average/?${queryParams}`
      : '/api/reports/daily-average/';

    return await this.apiClient.get<DailyAverageData[]>(endpoint);
  }

  async getCriticalEvents(filters: ReportFilters): Promise<CriticalEvent[]> {
    const queryParams = new URLSearchParams();

    if (filters.start_date) {
      queryParams.append('start_date', filters.start_date);
    }

    if (filters.end_date) {
      queryParams.append('end_date', filters.end_date);
    }

    if (filters.station_id) {
      queryParams.append('station_id', filters.station_id.toString());
    }

    if (filters.variable_type) {
      queryParams.append('variable_type', filters.variable_type);
    }

    const endpoint = queryParams.toString()
      ? `/api/reports/critical-events/?${queryParams}`
      : '/api/reports/critical-events/';

    return await this.apiClient.get<CriticalEvent[]>(endpoint);
  }

  async exportReport(type: string, filters: ReportFilters, format: ExportFormat): Promise<void> {
    const queryParams = new URLSearchParams();

    queryParams.append('type', type);
    queryParams.append('format', format);

    if (filters.start_date) {
      queryParams.append('start_date', filters.start_date);
    }

    if (filters.end_date) {
      queryParams.append('end_date', filters.end_date);
    }

    if (filters.station_id) {
      queryParams.append('station_id', filters.station_id.toString());
    }

    if (filters.variable_type) {
      queryParams.append('variable_type', filters.variable_type);
    }

    const endpoint = `/api/reports/export/?${queryParams}`;

    // Para descargas de archivos, necesitamos manejar la respuesta de manera diferente
    const response = await fetch(`${this.apiClient['baseURL']}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': this.apiClient['token'] ? `Token ${this.apiClient['token']}` : '',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al exportar reporte: ${response.statusText}`);
    }

    // Crear descarga automática del archivo
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    // Obtener el nombre del archivo del header Content-Disposition si está disponible
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `reporte_${type}_${new Date().toISOString().split('T')[0]}.${format}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}