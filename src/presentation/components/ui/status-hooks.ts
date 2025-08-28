/**
 * Hook para colores consistentes por tipo de dato
 */
export const useDataColors = () => ({
  nivel: {
    text: 'text-gov-primary',
    bg: 'bg-gov-primary',
    border: 'border-gov-primary',
    light: 'bg-gov-primary/10'
  },
  flujo: {
    text: 'text-gov-green',
    bg: 'bg-gov-green',
    border: 'border-gov-green',
    light: 'bg-gov-green/10'
  },
  caudal: {
    text: 'text-gov-blue',
    bg: 'bg-gov-blue', 
    border: 'border-gov-blue',
    light: 'bg-gov-blue/10'
  },
  velocidad: {
    text: 'text-gov-orange',
    bg: 'bg-gov-orange',
    border: 'border-gov-orange', 
    light: 'bg-gov-orange/10'
  },
  temperatura: {
    text: 'text-gov-red',
    bg: 'bg-gov-red',
    border: 'border-gov-red',
    light: 'bg-gov-red/10'
  }
})

/**
 * Hook para obtener configuración de alertas por severidad
 */
export const useAlertSeverityConfig = () => ({
  low: {
    color: 'text-gov-green',
    bg: 'bg-gov-green/10',
    border: 'border-gov-green/20',
    label: 'Bajo'
  },
  medium: {
    color: 'text-gov-orange', 
    bg: 'bg-gov-orange/10',
    border: 'border-gov-orange/20',
    label: 'Medio'
  },
  high: {
    color: 'text-gov-red',
    bg: 'bg-gov-red/10', 
    border: 'border-gov-red/20',
    label: 'Alto'
  },
  critical: {
    color: 'text-gov-red',
    bg: 'bg-gov-red/20',
    border: 'border-gov-red/40',
    label: 'Crítico'
  }
})