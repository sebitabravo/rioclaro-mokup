import { useAlerts } from '@shared/stores/AlertStore';

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
