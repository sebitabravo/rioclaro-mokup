import { DailyAverageData, CriticalEvent, ReportFilters, ExportFormat } from '@domain/entities/Report';
import { ReportRepository } from '@domain/repositories/ReportRepository';

export class GenerateDailyAverageReportUseCase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(filters: ReportFilters): Promise<DailyAverageData[]> {
    this.validateFilters(filters);
    return await this.reportRepository.getDailyAverage(filters);
  }

  private validateFilters(filters: ReportFilters): void {
    if (!filters.start_date || !filters.end_date) {
      throw new Error('Las fechas de inicio y fin son requeridas');
    }

    const startDate = new Date(filters.start_date);
    const endDate = new Date(filters.end_date);

    if (startDate > endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }

    // No permitir rangos muy amplios (más de 1 año)
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > oneYearMs) {
      throw new Error('El rango de fechas no puede exceder 1 año');
    }
  }
}

export class GenerateCriticalEventsReportUseCase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(filters: ReportFilters): Promise<CriticalEvent[]> {
    this.validateFilters(filters);
    return await this.reportRepository.getCriticalEvents(filters);
  }

  private validateFilters(filters: ReportFilters): void {
    if (!filters.start_date || !filters.end_date) {
      throw new Error('Las fechas de inicio y fin son requeridas');
    }

    const startDate = new Date(filters.start_date);
    const endDate = new Date(filters.end_date);

    if (startDate > endDate) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }
}

export class ExportReportUseCase {
  constructor(private reportRepository: ReportRepository) {}

  async execute(type: string, filters: ReportFilters, format: ExportFormat): Promise<void> {
    const validTypes = ['daily-average', 'critical-events', 'comparative'];
    if (!validTypes.includes(type)) {
      throw new Error('Tipo de reporte inválido');
    }

    const validFormats = ['csv', 'pdf', 'excel'];
    if (!validFormats.includes(format)) {
      throw new Error('Formato de exportación inválido');
    }

    return await this.reportRepository.exportReport(type, filters, format);
  }
}