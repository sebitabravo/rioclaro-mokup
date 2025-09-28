import React, { useEffect, useState } from 'react';
import { Settings, Bell, BellOff, Volume2, VolumeX, X, CheckCircle } from 'lucide-react';
import { EnhancedAlert } from '@shared/components/ui/EnhancedAlert';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { useAlerts } from '@shared/stores/AlertStore';
import { notificationService } from '@shared/services/NotificationService';

interface AlertContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxVisible?: number;
  showSettings?: boolean;
}

export function AlertContainer({
  position = 'top-right',
  maxVisible = 5,
  showSettings = true
}: AlertContainerProps) {
  const {
    alerts,
    globalSettings,
    removeAlert,
    clearAlerts,
    updateGlobalSettings
  } = useAlerts();

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Verificar permisos de notificación al cargar
  useEffect(() => {
    setNotificationPermission(notificationService.getPermissionStatus());
  }, []);

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    const hasPermission = await notificationService.checkPermission();
    setNotificationPermission(notificationService.getPermissionStatus());

    if (hasPermission) {
      updateGlobalSettings({ pushNotificationsEnabled: true });
    }
  };

  // Posicionamiento
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  // Alertas visibles (limitadas por maxVisible)
  const visibleAlerts = alerts.slice(0, maxVisible);
  const hiddenCount = alerts.length - visibleAlerts.length;

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-md w-full space-y-3`}>
      {/* Alertas */}
      {visibleAlerts.map((alert) => (
        <EnhancedAlert
          key={alert.id}
          alert={alert}
          onDismiss={removeAlert}
          showNotification={globalSettings.pushNotificationsEnabled}
        />
      ))}

      {/* Indicador de alertas ocultas */}
      {hiddenCount > 0 && (
        <Card className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              +{hiddenCount} alertas más
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Mostrar todas las alertas o navegar a página de alertas
                console.log('Ver todas las alertas');
              }}
              className="text-xs"
            >
              Ver todas
            </Button>
          </div>
        </Card>
      )}

      {/* Panel de configuración */}
      {showSettings && (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
            className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
            <span>Configurar Alertas</span>
          </Button>

          {showSettingsPanel && (
            <Card className="absolute bottom-full mb-2 w-full p-4 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Configuración de Alertas
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettingsPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sonidos */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {globalSettings.soundEnabled ? (
                      <Volume2 className="h-4 w-4 text-blue-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Sonidos</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateGlobalSettings({
                      soundEnabled: !globalSettings.soundEnabled
                    })}
                    className={globalSettings.soundEnabled ? 'text-blue-600' : 'text-gray-400'}
                  >
                    {globalSettings.soundEnabled ? 'Activado' : 'Desactivado'}
                  </Button>
                </div>

                {/* Notificaciones Push */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {globalSettings.pushNotificationsEnabled ? (
                      <Bell className="h-4 w-4 text-blue-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm">Notificaciones Push</span>
                  </div>

                  {notificationPermission === 'granted' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateGlobalSettings({
                        pushNotificationsEnabled: !globalSettings.pushNotificationsEnabled
                      })}
                      className={globalSettings.pushNotificationsEnabled ? 'text-blue-600' : 'text-gray-400'}
                    >
                      {globalSettings.pushNotificationsEnabled ? 'Activado' : 'Desactivado'}
                    </Button>
                  ) : notificationPermission === 'denied' ? (
                    <span className="text-xs text-red-600">Denegado</span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestNotificationPermission}
                      className="text-xs"
                    >
                      Permitir
                    </Button>
                  )}
                </div>

                {/* Auto-ocultar información */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-ocultar info</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateGlobalSettings({
                      autoHideInfo: !globalSettings.autoHideInfo
                    })}
                    className={globalSettings.autoHideInfo ? 'text-blue-600' : 'text-gray-400'}
                  >
                    {globalSettings.autoHideInfo ? 'Sí' : 'No'}
                  </Button>
                </div>

                {/* Auto-ocultar advertencias */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-ocultar advertencias</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateGlobalSettings({
                      autoHideWarning: !globalSettings.autoHideWarning
                    })}
                    className={globalSettings.autoHideWarning ? 'text-blue-600' : 'text-gray-400'}
                  >
                    {globalSettings.autoHideWarning ? 'Sí' : 'No'}
                  </Button>
                </div>

                {/* Acciones rápidas */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearAlerts('info')}
                      className="text-xs flex-1"
                    >
                      Limpiar Info
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => clearAlerts('warning')}
                      className="text-xs flex-1"
                    >
                      Limpiar Advertencias
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearAlerts()}
                    className="text-xs w-full mt-2"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Limpiar Todas
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// Hook para mostrar alertas de ejemplo (para testing)
export function useExampleAlerts() {
  const { showInfo, showWarning, showCritical, showEmergency } = useAlerts();

  const showExamples = () => {
    showInfo(
      'Sistema Actualizado',
      'Los datos han sido actualizados correctamente.'
    );

    setTimeout(() => {
      showWarning(
        'Estación Desconectada',
        'La estación río-norte-01 no responde desde hace 5 minutos.'
      );
    }, 1000);

    setTimeout(() => {
      showCritical(
        'Nivel Crítico Detectado',
        'La estación río-sur-02 reporta niveles críticos de agua.',
        1
      );
    }, 2000);

    setTimeout(() => {
      showEmergency(
        'EMERGENCIA MÚLTIPLE',
        'Múltiples estaciones en estado crítico simultáneo.',
        3
      );
    }, 3000);
  };

  return { showExamples };
}