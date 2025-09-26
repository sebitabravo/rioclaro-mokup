import { create } from 'zustand';
import { Station } from '@domain/entities/Station';
import { DIContainer } from '@infrastructure/di/Container';
import { CreateStationData } from '@application/use-cases/CreateStationUseCase';
import { UpdateStationData } from '@application/use-cases/UpdateStationUseCase';

interface StationState {
  stations: Station[];
  loading: boolean;
  error: string | null;
  selectedStation: Station | null;

  // Actions
  fetchStations: () => Promise<void>;
  fetchStationById: (id: number) => Promise<void>;
  createStation: (stationData: CreateStationData) => Promise<Station>;
  updateStation: (id: number, stationData: UpdateStationData) => Promise<Station>;
  deleteStation: (id: number) => Promise<boolean>;
  setSelectedStation: (station: Station | null) => void;
  clearError: () => void;
}

export const useStationStore = create<StationState>((set, get) => ({
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

  createStation: async (stationData: CreateStationData): Promise<Station> => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const newStation = await container.createStationUseCase.execute(stationData);

      const { stations } = get();
      set({ stations: [...stations, newStation], loading: false });

      return newStation;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al crear estación',
        loading: false
      });
      throw error;
    }
  },

  updateStation: async (id: number, stationData: UpdateStationData): Promise<Station> => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const updatedStation = await container.updateStationUseCase.execute(id, stationData);

      const { stations } = get();
      const updatedStations = stations.map(station =>
        station.id === id ? updatedStation : station
      );
      set({ stations: updatedStations, loading: false });

      return updatedStation;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al actualizar estación',
        loading: false
      });
      throw error;
    }
  },

  deleteStation: async (id: number): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const deleted = await container.deleteStationUseCase.execute(id);

      if (deleted) {
        const { stations } = get();
        const filteredStations = stations.filter(station => station.id !== id);
        set({ stations: filteredStations, loading: false });
      }

      return deleted;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Error al eliminar estación',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));