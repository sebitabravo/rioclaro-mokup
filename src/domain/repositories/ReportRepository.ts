import { DailyAverageData, CriticalEvent, ReportFilters, ExportFormat } from '../entities/Report';

export interface ReportRepository {
  getDailyAverage(filters: ReportFilters): Promise<DailyAverageData[]>;
  getCriticalEvents(filters: ReportFilters): Promise<CriticalEvent[]>;
  exportReport(type: string, filters: ReportFilters, format: ExportFormat): Promise<void>;
}