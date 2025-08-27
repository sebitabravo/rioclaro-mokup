import { create } from 'zustand';
import { Station } from '@domain/entities/Station';
import { DIContainer } from '@infrastructure/di/Container';

interface CreateStationData {
  name: string;
  code: string;
  location: string;
  latitude: number;
  longitude: number;
  threshold: number;
  current_level: number;
  status: 'active' | 'inactive' | 'maintenance';
  last_measurement: string;
}

interface UpdateStationData {
  name?: string;
  code?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  threshold?: number;
  current_level?: number;
  status?: 'active' | 'inactive' | 'maintenance';
  last_measurement?: string;
}

interface StationState {
  stations: Station[];
  loading: boolean;
  error: string | null;
  selectedStation: Station | null;
  
  // Actions
  fetchStations: () => Promise<void>;
  fetchStationById: (id: number) => Promise<void>;
  createStation: (stationData: CreateStationData) => Promise<void>;
  updateStation: (id: number, stationData: UpdateStationData) => Promise<void>;
  deleteStation: (id: number) => Promise<void>;
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

  createStation: async (stationData: CreateStationData) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      // Necesitamos crear el use case para crear estación
      // Por ahora simulamos la creación
      const newStation: Station = {
        id: Math.max(...get().stations.map(s => s.id)) + 1,
        ...stationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { stations } = get();
      set({ stations: [...stations, newStation], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear estación',
        loading: false 
      });
      throw error;
    }
  },

  updateStation: async (id: number, stationData: UpdateStationData) => {
    set({ loading: true, error: null });
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { stations } = get();
      const updatedStations = stations.map(station => 
        station.id === id 
          ? { ...station, ...stationData, updated_at: new Date().toISOString() }
          : station
      );
      set({ stations: updatedStations, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar estación',
        loading: false 
      });
      throw error;
    }
  },

  deleteStation: async (id: number) => {
    set({ loading: true, error: null });
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const { stations } = get();
      const filteredStations = stations.filter(station => station.id !== id);
      set({ stations: filteredStations, loading: false });
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