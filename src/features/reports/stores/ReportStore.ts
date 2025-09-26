import { create } from 'zustand';
import { DailyAverageData, CriticalEvent, ReportFilters, ExportFormat } from '@domain/entities/Report';
import { DIContainer } from '@infrastructure/di/Container';

interface ReportState {
  dailyAverageData: DailyAverageData[];
  criticalEvents: CriticalEvent[];
  loading: boolean;
  error: string | null;
  exporting: boolean;
  
  // Actions
  generateDailyAverageReport: (filters: ReportFilters) => Promise<void>;
  generateCriticalEventsReport: (filters: ReportFilters) => Promise<void>;
  exportReport: (type: string, filters: ReportFilters, format: ExportFormat) => Promise<void>;
  clearError: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  dailyAverageData: [],
  criticalEvents: [],
  loading: false,
  error: null,
  exporting: false,

  generateDailyAverageReport: async (filters: ReportFilters) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const data = await container.generateDailyAverageReportUseCase.execute(filters);
      set({ dailyAverageData: data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al generar reporte',
        loading: false 
      });
    }
  },

  generateCriticalEventsReport: async (filters: ReportFilters) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const events = await container.generateCriticalEventsReportUseCase.execute(filters);
      set({ criticalEvents: events, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al generar reporte de eventos críticos',
        loading: false 
      });
    }
  },

  exportReport: async (type: string, filters: ReportFilters, format: ExportFormat) => {
    set({ exporting: true, error: null });
    try {
      const container = DIContainer.getInstance();
      await container.exportReportUseCase.execute(type, filters, format);
      set({ exporting: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al exportar reporte',
        exporting: false 
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));