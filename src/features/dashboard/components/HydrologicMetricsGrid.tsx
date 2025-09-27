import { Waves, BarChart3, Droplets, Gauge } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useMemo } from 'react';
import type { MeasurementDataArray } from '@shared/types/data-sources';

interface HydrologicMetricsGridProps {
  measurementData: MeasurementDataArray;
}

const METRIC_DEFINITIONS = [
  {
    id: 'flujo',
    name: 'Flujo de Agua',
    icon: Waves,
    unit: 'm³/s',
    variant: 'success' as const
  },
  {
    id: 'nivel',
    name: 'Nivel Actual',
    icon: BarChart3,
    unit: 'm',
    variant: 'normal' as const
  },
  {
    id: 'caudal',
    name: 'Caudal',
    icon: Droplets,
    unit: 'L/s',
    variant: 'warning' as const
  },
  {
    id: 'velocidad',
    name: 'Velocidad del Flujo',
    icon: Gauge,
    unit: 'm/s',
    variant: 'critical' as const
  }
];

export function HydrologicMetricsGrid({ measurementData }: HydrologicMetricsGridProps) {
  // Calcular promedios en tiempo real de los datos
  const metrics = useMemo(() => {
    if (!measurementData || measurementData.length === 0) {
      // Valores por defecto si no hay datos
      return {
        flujo: { value: '2.0', subtitle: 'Normal - Estable' },
        nivel: { value: '2.5', subtitle: 'Nivel Seguro' },
        caudal: { value: '169.5', subtitle: 'Flujo Moderado' },
        velocidad: { value: '0.93', subtitle: 'Velocidad Normal' }
      };
    }

    // Calcular promedios reales de los datos
    const totalPoints = measurementData.length;

    // Promedio de nivel de agua (dato principal)
    const averageLevel = (measurementData.reduce((sum: number, point) => {
      const waterLevel = typeof point.water_level === 'number' ? point.water_level : 
                        typeof point.value === 'number' ? point.value : 0;
      return sum + waterLevel;
    }, 0) / totalPoints).toFixed(1);

    // Simular otros valores basados en el nivel (en producción vendrían de sensores reales)
    const level = parseFloat(averageLevel);
    const flujo = (level * 0.8).toFixed(1);
    const caudal = (level * 67.8).toFixed(1);
    const velocidad = (level * 0.37).toFixed(2);

    // Determinar estados basados en los valores
    const getFlowStatus = (val: number) => val > 2.0 ? 'Alto' : val > 1.5 ? 'Normal' : 'Bajo';
    const getLevelStatus = (val: number) => val > 3.0 ? 'Crítico' : val > 2.5 ? 'Alerta' : 'Seguro';
    const getCaudalStatus = (val: number) => val > 180 ? 'Alto' : val > 120 ? 'Moderado' : 'Bajo';
    const getVelocityStatus = (val: number) => val > 1.0 ? 'Rápida' : val > 0.7 ? 'Normal' : 'Lenta';

    return {
      flujo: {
        value: flujo,
        subtitle: `${getFlowStatus(parseFloat(flujo))} - Estable`
      },
      nivel: {
        value: averageLevel,
        subtitle: `Estado ${getLevelStatus(level)}`
      },
      caudal: {
        value: caudal,
        subtitle: `Flujo ${getCaudalStatus(parseFloat(caudal))}`
      },
      velocidad: {
        value: velocidad,
        subtitle: `Velocidad ${getVelocityStatus(parseFloat(velocidad))}`
      }
    };
  }, [measurementData]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6' data-testid="hydrologic-metrics-grid">
      {METRIC_DEFINITIONS.map((metric) => {
        const metricData = metrics[metric.id as keyof typeof metrics];

        return (
          <MetricCard
            key={metric.id}
            title={metric.name}
            value={`${metricData.value} ${metric.unit}`}
            subtitle={metricData.subtitle}
            icon={metric.icon}
            variant={metric.variant}
          />
        );
      })}
    </div>
  );
}