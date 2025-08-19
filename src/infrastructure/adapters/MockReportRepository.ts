import { DailyAverageData, CriticalEvent, ReportFilters, ExportFormat } from '@domain/entities/Report';
import { ReportRepository } from '@domain/repositories/ReportRepository';
import { mockDailyAverageData, mockCriticalEvents } from './MockDataRepository';

export class MockReportRepository implements ReportRepository {
  private dailyData: DailyAverageData[] = [...mockDailyAverageData];
  private criticalEvents: CriticalEvent[] = [...mockCriticalEvents];

  async getDailyAverage(filters: ReportFilters): Promise<DailyAverageData[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filtered = [...this.dailyData];
    
    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      filtered = filtered.filter(item => new Date(item.date) >= startDate);
    }
    
    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      filtered = filtered.filter(item => new Date(item.date) <= endDate);
    }
    
    if (filters.station_id) {
      // En un caso real, filtrarías por station_id, aquí simulamos
      filtered = filtered.filter(item => item.station_name.includes('Norte'));
    }
    
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getCriticalEvents(filters: ReportFilters): Promise<CriticalEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filtered = [...this.criticalEvents];
    
    if (filters.start_date) {
      const startDate = new Date(filters.start_date);
      filtered = filtered.filter(event => new Date(event.timestamp) >= startDate);
    }
    
    if (filters.end_date) {
      const endDate = new Date(filters.end_date);
      filtered = filtered.filter(event => new Date(event.timestamp) <= endDate);
    }
    
    if (filters.station_id) {
      // En un caso real, filtrarías por station_id
      filtered = filtered.filter(event => event.station_name.includes('Sur'));
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async exportReport(type: string, filters: ReportFilters, format: ExportFormat): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular generación y descarga de archivo
    const filename = `reporte_${type}_${filters.start_date}_${filters.end_date}.${format}`;
    
    let content = '';
    
    if (type === 'daily-average') {
      const data = await this.getDailyAverage(filters);
      content = this.generateCSVContent(data, [
        'Fecha', 'Estación', 'Promedio (m)', 'Mínimo (m)', 'Máximo (m)', 'Mediciones'
      ], (item) => [
        item.date,
        item.station_name,
        item.average_value.toFixed(2),
        item.min_value.toFixed(2),
        item.max_value.toFixed(2),
        item.measurement_count.toString()
      ]);
    } else if (type === 'critical-events') {
      const data = await this.getCriticalEvents(filters);
      content = this.generateCSVContent(data, [
        'Fecha', 'Estación', 'Nivel (m)', 'Umbral (m)', 'Duración (min)'
      ], (item) => [
        new Date(item.timestamp).toLocaleString('es-CL'),
        item.station_name,
        item.water_level.toFixed(2),
        item.threshold.toFixed(2),
        item.duration_minutes.toString()
      ]);
    }
    
    this.downloadFile(content, filename, `text/${format}`);
  }

  private generateCSVContent<T>(data: T[], headers: string[], rowMapper: (item: T) => string[]): string {
    const csvRows = [
      headers.join(','),
      ...data.map(item => rowMapper(item).join(','))
    ];
    return csvRows.join('\n');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}