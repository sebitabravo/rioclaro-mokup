import { create } from 'zustand';
import { Measurement, MeasurementFilters } from '@domain/entities/Measurement';
import { DIContainer } from '@infrastructure/di/Container';

interface MeasurementState {
  measurements: Measurement[]; // Unified measurements array
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchLatestMeasurements: (stationId?: number) => Promise<void>;
  fetchHistoricalMeasurements: (filters: MeasurementFilters) => Promise<void>;
  clearError: () => void;
}

export const useMeasurementStore = create<MeasurementState>((set) => ({
  measurements: [],
  loading: false,
  error: null,

  fetchLatestMeasurements: async (stationId?: number) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const measurements = await container.getLatestMeasurementsUseCase.execute(stationId);
      set({ 
        measurements,
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
      set({ 
        measurements,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar mediciones históricas',
        loading: false 
      });
    }
  },


  clearError: () => {
    set({ error: null });
  },
}));