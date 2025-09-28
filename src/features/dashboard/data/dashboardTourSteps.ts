import { OnboardingStep } from '@shared/components/onboarding/OnboardingTour';

export const dashboardTourSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido al Sistema RíoClaro!',
    description: 'Este es tu panel de control principal donde puedes monitorear el estado de todas las estaciones de medición en tiempo real. Te guiaremos por las funciones principales.',
    target: '[data-testid="dashboard-content"]',
    position: 'bottom'
  },
  {
    id: 'metrics-grid',
    title: 'Métricas del Sistema',
    description: 'Aquí puedes ver un resumen rápido del estado general: total de estaciones, estaciones activas, críticas y el promedio de nivel de agua.',
    target: '[aria-labelledby="metrics-heading"]',
    position: 'bottom'
  },
  {
    id: 'emergency-alerts',
    title: 'Alertas de Emergencia',
    description: 'Cuando hay estaciones en estado crítico, aparecerá una alerta prominente aquí para llamar tu atención inmediatamente.',
    target: '[data-testid="dashboard-content"]',
    position: 'top'
  },
  {
    id: 'stations-map',
    title: 'Mapa de Estaciones',
    description: 'El mapa te muestra la ubicación geográfica de todas las estaciones. Los colores indican el estado: verde (normal), amarillo (alerta), rojo (crítico).',
    target: '[aria-labelledby="map-heading"]',
    position: 'right'
  },
  {
    id: 'metrics-dashboard',
    title: 'Gráficos de Tendencias',
    description: 'Los gráficos muestran las tendencias recientes de los niveles de agua. Puedes ver patrones y cambios a lo largo del tiempo.',
    target: '[aria-labelledby="dashboard-heading"]',
    position: 'left'
  },
  {
    id: 'navigation',
    title: 'Navegación Principal',
    description: 'Usa el menú superior para navegar entre las diferentes secciones: Dashboard, Análisis, Historial, Alertas y Admin (según tu rol).',
    target: 'nav',
    position: 'bottom'
  },
  {
    id: 'user-menu',
    title: 'Menú de Usuario',
    description: 'Aquí puedes ver tu información personal, rol en el sistema y cerrar sesión. También puedes cambiar entre tema claro y oscuro.',
    target: '[role="button"]:has([data-lucide="user"])',
    position: 'bottom'
  },
  {
    id: 'auto-refresh',
    title: 'Actualización Automática',
    description: 'Los datos se actualizan automáticamente cada 5 minutos. También puedes forzar una actualización manual usando el botón de refrescar.',
    target: '[data-testid="dashboard-content"]',
    position: 'top'
  }
];

// Tour específico para administradores
export const adminTourSteps: OnboardingStep[] = [
  {
    id: 'admin-welcome',
    title: 'Panel de Administración',
    description: 'Como administrador, tienes acceso a funciones avanzadas para gestionar usuarios, estaciones y configuraciones del sistema.',
    target: '[data-testid="admin-dashboard"]',
    position: 'bottom'
  },
  {
    id: 'user-management',
    title: 'Gestión de Usuarios',
    description: 'Aquí puedes crear, editar y eliminar usuarios del sistema. También puedes asignar roles y permisos específicos.',
    target: '[aria-label="Tabs"] button:first-child',
    position: 'bottom'
  },
  {
    id: 'station-management',
    title: 'Gestión de Estaciones',
    description: 'Administra las estaciones de monitoreo: agregar nuevas, editar existentes, configurar umbrales de alerta y ver el estado de conectividad.',
    target: '[aria-label="Tabs"] button:nth-child(2)',
    position: 'bottom'
  },
  {
    id: 'system-settings',
    title: 'Configuración del Sistema',
    description: 'Configura parámetros generales del sistema, intervalos de actualización, y otras opciones avanzadas.',
    target: '[aria-label="Tabs"] button:nth-child(3)',
    position: 'bottom'
  }
];

// Tour para reportes y análisis
export const reportsTourSteps: OnboardingStep[] = [
  {
    id: 'reports-overview',
    title: 'Análisis y Reportes',
    description: 'Esta sección te permite generar reportes detallados y realizar análisis profundos de los datos históricos.',
    target: '[data-testid="reports-content"]',
    position: 'bottom'
  },
  {
    id: 'chart-controls',
    title: 'Controles de Gráficos',
    description: 'Usa estos controles para filtrar datos por fechas, estaciones específicas y tipos de medición.',
    target: '[data-testid="chart-controls"]',
    position: 'bottom'
  },
  {
    id: 'export-options',
    title: 'Opciones de Exportación',
    description: 'Puedes exportar los datos y gráficos en varios formatos: PDF, Excel, imágenes para incluir en presentaciones.',
    target: '[data-testid="export-controls"]',
    position: 'top'
  }
];