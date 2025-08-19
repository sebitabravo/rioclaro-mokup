import { create } from 'zustand';
import { Measurement, MeasurementFilters } from '@domain/entities/Measurement';
import { DIContainer } from '@infrastructure/di/Container';
import { DataNormalizationService, ChartDataSet, DataSourceType } from '@shared/services/DataNormalizationService';

interface MeasurementState {
  latestMeasurements: Measurement[];
  historicalMeasurements: Measurement[];
  loading: boolean;
  error: string | null;
  
  // Normalized chart data
  normalizedLatest: ChartDataSet | null;
  normalizedHistorical: ChartDataSet | null;
  
  // Actions
  fetchLatestMeasurements: (stationId?: number) => Promise<void>;
  fetchHistoricalMeasurements: (filters: MeasurementFilters) => Promise<void>;
  getNormalizedData: (type: 'latest' | 'historical', sourceType?: DataSourceType) => ChartDataSet;
  clearError: () => void;
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  latestMeasurements: [],
  historicalMeasurements: [],
  loading: false,
  error: null,
  normalizedLatest: null,
  normalizedHistorical: null,

  fetchLatestMeasurements: async (stationId?: number) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const measurements = await container.getLatestMeasurementsUseCase.execute(stationId);
      const normalized = DataNormalizationService.normalize(measurements, DataSourceType.MEASUREMENT);
      set({ 
        latestMeasurements: measurements, 
        normalizedLatest: normalized,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar mediciones',
        loading: false 
      });
    }
  },

  fetchHistoricalMeasurements: async (filters: MeasurementFilters) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const measurements = await container.getHistoricalMeasurementsUseCase.execute(filters);
      const normalized = DataNormalizationService.normalize(measurements, DataSourceType.MEASUREMENT);
      set({ 
        historicalMeasurements: measurements,
        normalizedHistorical: normalized,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar mediciones históricas',
        loading: false 
      });
    }
  },

  getNormalizedData: (type: 'latest' | 'historical', sourceType: DataSourceType = DataSourceType.MEASUREMENT) => {
    const state = get();
    const data = type === 'latest' ? state.latestMeasurements : state.historicalMeasurements;
    return DataNormalizationService.normalize(data, sourceType);
  },

  clearError: () => {
    set({ error: null });
  },
}));