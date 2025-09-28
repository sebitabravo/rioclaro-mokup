import React from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AlertConfiguration, CreateAlertConfigurationData, UpdateAlertConfigurationData } from '@domain/entities/Alert';
import { Station } from '@domain/entities/Station';
import { Measurement } from '@domain/entities/Measurement';
import { DIContainer } from '@infrastructure/di/Container';

interface AlertConfigurationState {
  // Estado de datos
  configurations: AlertConfiguration[];
  stations: Station[];
  currentMeasurements: Record<string, Measurement[]>; // key: `${stationId}-${sensorType}`
  selectedStationId: number | null;
  selectedConfiguration: AlertConfiguration | null;

  // Estados de carga
  isLoading: boolean;
  isLoadingStations: boolean;
  isLoadingMeasurements: boolean;
  isSaving: boolean;

  // Estados de error
  error: string | null;
  validationErrors: Record<string, string>;

  // Estados de UI
  isFormOpen: boolean;
  isDeleteDialogOpen: boolean;
  configurationToDelete: AlertConfiguration | null;
}

interface AlertConfigurationActions {
  // Acciones de carga de datos
  loadConfigurations: () => Promise<void>;
  loadStations: () => Promise<void>;
  loadConfigurationsByStation: (stationId: number) => Promise<void>;
  loadCurrentMeasurements: (stationId: number, sensorType: string) => Promise<void>;

  // Acciones CRUD
  createConfiguration: (data: CreateAlertConfigurationData) => Promise<void>;
  updateConfiguration: (id: number, data: UpdateAlertConfigurationData) => Promise<void>;
  deleteConfiguration: (id: number) => Promise<void>;

  // Propiedades computadas para compatibilidad con componentes
  formConfiguration: AlertConfiguration | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Acciones de selección
  selectStation: (stationId: number | null) => void;
  selectConfiguration: (configuration: AlertConfiguration | null) => void;

  // Acciones de UI
  openForm: (configuration?: AlertConfiguration) => void;
  closeForm: () => void;
  openDeleteDialog: (configuration: AlertConfiguration) => void;
  closeDeleteDialog: () => void;

  // Acciones de manejo de errores
  clearError: () => void;
  setValidationError: (field: string, message: string) => void;
  clearValidationErrors: () => void;

  // Acciones de utilidad
  getConfigurationForSensor: (stationId: number, sensorType: string) => AlertConfiguration | undefined;
  getAvailableSensorTypes: (stationId: number) => string[];
  refreshData: () => Promise<void>;
}

type AlertConfigurationStore = AlertConfigurationState & AlertConfigurationActions;

const container = DIContainer.getInstance();

export const useAlertStore = create<AlertConfigurationStore>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Estado inicial
      configurations: [],
      stations: [],
      currentMeasurements: {},
      selectedStationId: null,
      selectedConfiguration: null,
      isLoading: false,
      isLoadingStations: false,
      isLoadingMeasurements: false,
      isSaving: false,
      error: null,
      validationErrors: {},
      isFormOpen: false,
      isDeleteDialogOpen: false,
      configurationToDelete: null,

      // Propiedades computadas
      get formConfiguration() {
        return get().selectedConfiguration;
      },
      get isCreating() {
        return get().isSaving && !get().selectedConfiguration;
      },
      get isUpdating() {
        return get().isSaving && !!get().selectedConfiguration;
      },
      get isDeleting() {
        return get().isSaving && get().isDeleteDialogOpen;
      },

      // Implementación de acciones
      loadConfigurations: async () => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // TODO: Implementar use case cuando esté disponible en el container
          // const configurations = await container.getAlertConfigurationsUseCase.execute();
          const configurations: AlertConfiguration[] = []; // Temporal

          set(state => {
            state.configurations = configurations;
            state.isLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al cargar configuraciones';
            state.isLoading = false;
          });
        }
      },

      loadStations: async () => {
        set(state => {
          state.isLoadingStations = true;
          state.error = null;
        });

        try {
          const stations = await container.getStationsUseCase.execute();

          set(state => {
            state.stations = stations;
            state.isLoadingStations = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al cargar estaciones';
            state.isLoadingStations = false;
          });
        }
      },

      loadConfigurationsByStation: async (stationId: number) => {
        set(state => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // TODO: Implementar use case cuando esté disponible en el container
          // const configurations = await container.getAlertConfigurationsByStationUseCase.execute(stationId);
          const configurations: AlertConfiguration[] = []; // Temporal

          set(state => {
            // Actualizar solo las configuraciones de esta estación
            state.configurations = state.configurations.filter((c: AlertConfiguration) => c.station_id !== stationId).concat(configurations);
            state.isLoading = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al cargar configuraciones de la estación';
            state.isLoading = false;
          });
        }
      },

      loadCurrentMeasurements: async (stationId: number, sensorType: string) => {
        set(state => {
          state.isLoadingMeasurements = true;
        });

        try {
          const measurements = await container.getLatestMeasurementsUseCase.execute(stationId);

          const key = `${stationId}-${sensorType}`;

          set(state => {
            state.currentMeasurements[key] = measurements;
            state.isLoadingMeasurements = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al cargar mediciones actuales';
            state.isLoadingMeasurements = false;
          });
        }
      },

      createConfiguration: async (data: CreateAlertConfigurationData) => {
        set(state => {
          state.isSaving = true;
          state.error = null;
          state.validationErrors = {};
        });

        try {
          // TODO: Implementar use case cuando esté disponible en el container
          // const newConfiguration = await container.createAlertConfigurationUseCase.execute(data);
          const newConfiguration: AlertConfiguration = {
            id: Date.now(), // Temporal
            station_id: data.station_id,
            sensor_type: data.sensor_type,
            sensor_unit: 'unknown',
            is_active: data.is_active ?? true,
            thresholds: data.thresholds.map(t => ({
              ...t,
              id: Date.now() + Math.random(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          set(state => {
            state.configurations.push(newConfiguration);
            state.isSaving = false;
            state.isFormOpen = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al crear configuración';
            state.isSaving = false;
          });
        }
      },

      updateConfiguration: async (id: number, data: UpdateAlertConfigurationData) => {
        set(state => {
          state.isSaving = true;
          state.error = null;
          state.validationErrors = {};
        });

        try {
          // TODO: Implementar use case cuando esté disponible en el container
          // const updatedConfiguration = await container.updateAlertConfigurationUseCase.execute(id, data);

          set(state => {
            const index = state.configurations.findIndex((c: AlertConfiguration) => c.id === id);
            if (index !== -1) {
              // Temporal: actualización simulada
              if (data.is_active !== undefined) {
                state.configurations[index].is_active = data.is_active;
              }
              if (data.thresholds) {
                state.configurations[index].thresholds = data.thresholds.map(t => ({
                  ...t,
                  id: 'id' in t ? t.id : Date.now() + Math.random(),
                  created_at: 'created_at' in t ? String(t.created_at) : new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }));
              }
              state.configurations[index].updated_at = new Date().toISOString();
            }
            state.isSaving = false;
            state.isFormOpen = false;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al actualizar configuración';
            state.isSaving = false;
          });
        }
      },

      deleteConfiguration: async (id: number) => {
        set(state => {
          state.isSaving = true;
          state.error = null;
        });

        try {
          // TODO: Implementar use case cuando esté disponible en el container
          // await container.deleteAlertConfigurationUseCase.execute(id);

          set(state => {
            state.configurations = state.configurations.filter((c: AlertConfiguration) => c.id !== id);
            state.isSaving = false;
            state.isDeleteDialogOpen = false;
            state.configurationToDelete = null;
          });
        } catch (error) {
          set(state => {
            state.error = error instanceof Error ? error.message : 'Error al eliminar configuración';
            state.isSaving = false;
          });
        }
      },

      selectStation: (stationId: number | null) => {
        set(state => {
          state.selectedStationId = stationId;
          state.selectedConfiguration = null;
        });

        if (stationId) {
          get().loadConfigurationsByStation(stationId);
        }
      },

      selectConfiguration: (configuration: AlertConfiguration | null) => {
        set(state => {
          state.selectedConfiguration = configuration;
        });
      },

      openForm: (configuration?: AlertConfiguration) => {
        set(state => {
          state.isFormOpen = true;
          state.selectedConfiguration = configuration || null;
          state.validationErrors = {};
          state.error = null;
        });
      },

      closeForm: () => {
        set(state => {
          state.isFormOpen = false;
          state.selectedConfiguration = null;
          state.validationErrors = {};
          state.error = null;
        });
      },

      openDeleteDialog: (configuration: AlertConfiguration) => {
        set(state => {
          state.isDeleteDialogOpen = true;
          state.configurationToDelete = configuration;
        });
      },

      closeDeleteDialog: () => {
        set(state => {
          state.isDeleteDialogOpen = false;
          state.configurationToDelete = null;
        });
      },

      clearError: () => {
        set(state => {
          state.error = null;
        });
      },

      setValidationError: (field: string, message: string) => {
        set(state => {
          state.validationErrors[field] = message;
        });
      },

      clearValidationErrors: () => {
        set(state => {
          state.validationErrors = {};
        });
      },

      getConfigurationForSensor: (stationId: number, sensorType: string) => {
        const state = get();
        return state.configurations.find(
          c => c.station_id === stationId && c.sensor_type === sensorType
        );
      },

      getAvailableSensorTypes: (stationId: number) => {
        const state = get();
        const measurements = Object.keys(state.currentMeasurements)
          .filter(k => k.startsWith(`${stationId}-`))
          .flatMap(k => state.currentMeasurements[k]);

        const uniqueSensorTypes = Array.from(
          new Set(measurements.map(m => m.variable_type))
        );

        return uniqueSensorTypes;
      },

      refreshData: async () => {
        const state = get();
        await Promise.all([
          state.loadConfigurations(),
          state.loadStations()
        ]);
      }
    }))
  )
);

// Hook personalizado para facilitar el uso
export const useAlertConfiguration = () => {
  const store = useAlertStore();

  // Auto-cargar datos al montar el componente
  React.useEffect(() => {
    store.refreshData();
  }, [store]);

  return store;
};
