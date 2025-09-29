import { create } from 'zustand';

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  autoRefreshInterval: number;
  allowNotifications: boolean;
  autoBackupEnabled: boolean;
  dataRetentionDays: number;
  alertEscalationEnabled: boolean;
  alertAutoAcknowledge: boolean;
  lastBackupAt: string | null;
  updatedAt: string | null;
}

interface SystemSettingsState {
  settings: SystemSettings;
  loading: boolean;
  saving: boolean;
  backupLoading: boolean;
  error: string | null;
  success: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (changes: Partial<SystemSettings>) => Promise<void>;
  triggerBackup: () => Promise<void>;
  clearStatus: () => void;
  resetToDefaults: () => Promise<void>;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  maintenanceMessage: '',
  autoRefreshInterval: 5,
  allowNotifications: true,
  autoBackupEnabled: true,
  dataRetentionDays: 90,
  alertEscalationEnabled: true,
  alertAutoAcknowledge: false,
  lastBackupAt: null,
  updatedAt: null
};

const STORAGE_KEY = 'rioclaro_system_settings';

const loadFromStorage = (): SystemSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(raw) as Partial<SystemSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed
    };
  } catch (error) {
    console.warn('Error cargando configuración del sistema:', error);
    return DEFAULT_SETTINGS;
  }
};

const persistToStorage = (settings: SystemSettings) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Error guardando configuración del sistema:', error);
  }
};

export const useSystemSettingsStore = create<SystemSettingsState>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  loading: false,
  saving: false,
  backupLoading: false,
  error: null,
  success: null,

  fetchSettings: async () => {
    set({ loading: true, error: null, success: null });

    await new Promise(resolve => setTimeout(resolve, 350));

    const storedSettings = loadFromStorage();
    set({ settings: storedSettings, loading: false });
  },

  updateSettings: async (changes) => {
    const currentSettings = get().settings;
    const updatedSettings: SystemSettings = {
      ...currentSettings,
      ...changes,
      updatedAt: new Date().toISOString()
    };

    set({ saving: true, error: null, success: null, settings: updatedSettings });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      persistToStorage(updatedSettings);
      set({ saving: false, success: 'Configuración guardada correctamente.' });
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : 'No se pudo guardar la configuración.'
      });
      set({ settings: currentSettings });
    }
  },

  triggerBackup: async () => {
    set({ backupLoading: true, error: null, success: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const currentSettings = get().settings;
      const updatedSettings: SystemSettings = {
        ...currentSettings,
        lastBackupAt: new Date().toISOString(),
        updatedAt: currentSettings.updatedAt || new Date().toISOString()
      };

    set({ settings: updatedSettings, backupLoading: false, success: 'Respaldo iniciado correctamente.' });
      persistToStorage(updatedSettings);
    } catch (error) {
      set({
        backupLoading: false,
        error: error instanceof Error ? error.message : 'No se pudo iniciar el respaldo.'
      });
    }
  },

  clearStatus: () => {
    set({ error: null, success: null });
  },

  resetToDefaults: async () => {
  set({ saving: true, error: null, success: null, settings: { ...DEFAULT_SETTINGS } });

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      persistToStorage(DEFAULT_SETTINGS);
      set({ saving: false, success: 'Se restauraron los valores predeterminados.' });
    } catch (error) {
      set({
        saving: false,
        error: error instanceof Error ? error.message : 'No se pudo restablecer la configuración.'
      });
    }
  }
}));
