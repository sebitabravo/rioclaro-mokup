import { useCallback } from 'react';
import { create } from 'zustand';
import { AlertData } from '@shared/components/ui/EnhancedAlert';
import { NotificationLevel } from '@shared/services/NotificationService';

interface AlertStore {
  // State
  alerts: AlertData[];
  globalSettings: {
    soundEnabled: boolean;
    pushNotificationsEnabled: boolean;
    autoHideInfo: boolean;
    autoHideWarning: boolean;
  };

  // Actions
  addAlert: (alert: Omit<AlertData, 'id' | 'timestamp'>) => void;
  removeAlert: (alertId: string) => void;
  clearAlerts: (level?: NotificationLevel) => void;
  updateGlobalSettings: (settings: Partial<AlertStore['globalSettings']>) => void;

  // Convenience methods
  showInfo: (title: string, message: string, actions?: AlertData['actions']) => void;
  showWarning: (title: string, message: string, actions?: AlertData['actions']) => void;
  showCritical: (title: string, message: string, stationCount?: number, actions?: AlertData['actions']) => void;
  showEmergency: (title: string, message: string, stationCount?: number, actions?: AlertData['actions']) => void;

  // Getters
  getCriticalCount: () => number;
  getEmergencyCount: () => number;
  hasActiveAlerts: () => boolean;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  // Initial state
  alerts: [],
  globalSettings: {
    soundEnabled: true,
    pushNotificationsEnabled: true,
    autoHideInfo: true,
    autoHideWarning: false,
  },

  // Add new alert
  addAlert: (alertData) => {
    const alert: AlertData = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    set((state) => ({
      alerts: [...state.alerts, alert]
    }));

    // Auto-hide certain types of alerts
    if (get().globalSettings.autoHideInfo && alert.level === 'info') {
      setTimeout(() => {
        get().removeAlert(alert.id);
      }, 5000);
    }

    if (get().globalSettings.autoHideWarning && alert.level === 'warning') {
      setTimeout(() => {
        get().removeAlert(alert.id);
      }, 10000);
    }

    return alert.id;
  },

  // Remove alert
  removeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter(alert => alert.id !== alertId)
    }));
  },

  // Clear alerts by level or all
  clearAlerts: (level) => {
    set((state) => ({
      alerts: level
        ? state.alerts.filter(alert => alert.level !== level)
        : []
    }));
  },

  // Update global settings
  updateGlobalSettings: (newSettings) => {
    set((state) => ({
      globalSettings: { ...state.globalSettings, ...newSettings }
    }));

    // Save to localStorage
    localStorage.setItem(
      'rioclaro_alert_settings',
      JSON.stringify(get().globalSettings)
    );
  },

  // Convenience methods
  showInfo: (title, message, actions) => {
    const { globalSettings } = get();
    get().addAlert({
      level: 'info',
      title,
      message,
      actions,
      playSound: globalSettings.soundEnabled,
      persistent: false
    });
  },

  showWarning: (title, message, actions) => {
    const { globalSettings } = get();
    get().addAlert({
      level: 'warning',
      title,
      message,
      actions,
      playSound: globalSettings.soundEnabled,
      persistent: false
    });
  },

  showCritical: (title, message, stationCount, actions) => {
    const { globalSettings } = get();
    get().addAlert({
      level: 'critical',
      title,
      message,
      stationCount,
      actions,
      playSound: globalSettings.soundEnabled,
      persistent: true
    });
  },

  showEmergency: (title, message, stationCount, actions) => {
    const { globalSettings } = get();
    get().addAlert({
      level: 'emergency',
      title,
      message,
      stationCount,
      actions,
      playSound: globalSettings.soundEnabled,
      persistent: true
    });
  },

  // Getters
  getCriticalCount: () => {
    return get().alerts.filter(alert => alert.level === 'critical').length;
  },

  getEmergencyCount: () => {
    return get().alerts.filter(alert => alert.level === 'emergency').length;
  },

  hasActiveAlerts: () => {
    return get().alerts.length > 0;
  },
}));

// Load settings from localStorage on initialization
const savedSettings = localStorage.getItem('rioclaro_alert_settings');
if (savedSettings) {
  try {
    const settings = JSON.parse(savedSettings);
    useAlertStore.getState().updateGlobalSettings(settings);
  } catch (error) {
    console.warn('Error loading alert settings:', error);
  }
}

// Hook para usar el store de alertas con funciones helper
export function useAlerts() {
  const alerts = useAlertStore((state) => state.alerts);
  const globalSettings = useAlertStore((state) => state.globalSettings);
  const addAlert = useAlertStore((state) => state.addAlert);
  const removeAlert = useAlertStore((state) => state.removeAlert);
  const clearAlerts = useAlertStore((state) => state.clearAlerts);
  const updateGlobalSettings = useAlertStore((state) => state.updateGlobalSettings);
  const showInfo = useAlertStore((state) => state.showInfo);
  const showWarning = useAlertStore((state) => state.showWarning);
  const showCritical = useAlertStore((state) => state.showCritical);
  const showEmergency = useAlertStore((state) => state.showEmergency);
  const getCriticalCount = useAlertStore((state) => state.getCriticalCount);
  const getEmergencyCount = useAlertStore((state) => state.getEmergencyCount);
  const hasActiveAlerts = useAlertStore((state) => state.hasActiveAlerts);

  const checkStationAlerts = useCallback(
    (stations: Array<{ id: number; status: string; name: string }>) => {
      const criticalStations = stations.filter((s) => s.status === 'critical');
      const warningStations = stations.filter((s) => s.status === 'warning');

      clearAlerts('critical');
      clearAlerts('warning');

      if (criticalStations.length > 0) {
        if (criticalStations.length >= 3) {
          showEmergency(
            '🚨 EMERGENCIA DEL SISTEMA',
            `${criticalStations.length} estaciones en estado crítico. Activar protocolo de emergencia inmediatamente.`,
            criticalStations.length,
            [
              {
                label: 'Protocolo Emergencia',
                onClick: () => {
                  window.open('/emergency-protocol', '_blank');
                },
                variant: 'destructive',
                icon: '🚨',
              },
              {
                label: 'Ver Estaciones',
                onClick: () => {
                  window.location.href = '/stations?filter=critical';
                },
                variant: 'outline',
                icon: '👁️',
              },
            ]
          );
        } else {
          showCritical(
            '🔴 ALERTA CRÍTICA',
            `${criticalStations.length} ${criticalStations.length === 1 ? 'estación presenta' : 'estaciones presentan'} niveles críticos.`,
            criticalStations.length,
            [
              {
                label: 'Ver Detalles',
                onClick: () => {
                  window.location.href = '/stations?filter=critical';
                },
                variant: 'default',
                icon: '👁️',
              },
              {
                label: 'Contactar Técnico',
                onClick: () => {
                  window.open('tel:+56-9-12345678');
                },
                variant: 'outline',
                icon: '📞',
              },
            ]
          );
        }
      }

      if (warningStations.length > 0 && criticalStations.length === 0) {
        showWarning(
          '⚠️ Alerta de Monitoreo',
          `${warningStations.length} ${warningStations.length === 1 ? 'estación requiere' : 'estaciones requieren'} atención.`,
          [
            {
              label: 'Ver Estaciones',
              onClick: () => {
                window.location.href = '/stations?filter=warning';
              },
              variant: 'outline',
              icon: '👁️',
            },
          ]
        );
      }
    },
    [clearAlerts, showCritical, showEmergency, showWarning]
  );

  const showConnectionAlert = useCallback(
    (isOnline: boolean) => {
      if (!isOnline) {
        showWarning(
          'Conexión Perdida',
          'Se ha perdido la conexión a internet. Los datos pueden no estar actualizados.',
          [
            {
              label: 'Reintentar',
              onClick: () => {
                window.location.reload();
              },
              variant: 'outline',
              icon: '🔄',
            },
          ]
        );
      } else {
        showInfo(
          'Conexión Restablecida',
          'La conexión se ha restablecido correctamente.'
        );
      }
    },
    [showInfo, showWarning]
  );

  return {
    alerts,
    globalSettings,
    addAlert,
    removeAlert,
    clearAlerts,
    updateGlobalSettings,
    showInfo,
    showWarning,
    showCritical,
    showEmergency,
    getCriticalCount,
    getEmergencyCount,
    hasActiveAlerts,
    checkStationAlerts,
    showConnectionAlert,
  };
}