import { create } from 'zustand';
import { Station } from '@domain/entities/Station';
import { DIContainer } from '@infrastructure/di/Container';

interface StationState {
  stations: Station[];
  loading: boolean;
  error: string | null;
  selectedStation: Station | null;
  
  // Actions
  fetchStations: () => Promise<void>;
  fetchStationById: (id: number) => Promise<void>;
  setSelectedStation: (station: Station | null) => void;
  clearError: () => void;
}

export const useStationStore = create<StationState>((set) => ({
  stations: [],
  loading: false,
  error: null,
  selectedStation: null,

  fetchStations: async () => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const stations = await container.getStationsUseCase.execute();
      set({ stations, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar estaciones',
        loading: false 
      });
    }
  },

  fetchStationById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const station = await container.getStationByIdUseCase.execute(id);
      set({ selectedStation: station, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar estación',
        loading: false 
      });
    }
  },

  setSelectedStation: (station: Station | null) => {
    set({ selectedStation: station });
  },

  clearError: () => {
    set({ error: null });
  },
}));