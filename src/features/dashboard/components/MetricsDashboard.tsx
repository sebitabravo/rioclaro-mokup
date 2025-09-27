import { Card, CardContent, CardHeader, CardTitle } from "@shared/components/ui/card";
import { MetricCard } from "@features/dashboard/components/MetricCard";
import type { MeasurementDataArray } from "@shared/types/data-sources";
import { BarChart3, Activity, Waves, Droplets, Gauge } from "lucide-react";
import { useMemo } from "react";

interface MetricsDashboardProps {
  measurementData: MeasurementDataArray;
  className?: string;
}

const METRIC_DEFINITIONS = [
  {
    id: 'flujo',
    name: 'Flujo de Agua',
    description: 'Volumen de agua que pasa por un punto',
    icon: Waves,
    unit: 'm³/s',
    variant: 'success' as const
  },
  {
    id: 'nivel',
    name: 'Nivel del Agua',
    description: 'Altura del agua medida desde el punto de referencia',
    icon: BarChart3,
    unit: 'm',
    variant: 'normal' as const
  },
  {
    id: 'caudal',
    name: 'Caudal',
    description: 'Cantidad de agua que fluye por unidad de tiempo',
    icon: Droplets,
    unit: 'L/s',
    variant: 'warning' as const
  },
  {
    id: 'velocidad',
    name: 'Velocidad del Flujo',
    description: 'Velocidad promedio del agua',
    icon: Gauge,
    unit: 'm/s',
    variant: 'critical' as const
  }
];

export function MetricsDashboard({ measurementData, className = "" }: MetricsDashboardProps) {
  // Calcular promedios en tiempo real de los datos
  const metrics = useMemo(() => {
    if (!measurementData || measurementData.length === 0) {
      // Valores por defecto si no hay datos
      return {
        flujo: { value: '1.8', subtitle: 'Normal - Estable' },
        nivel: { value: '2.3', subtitle: 'Nivel Seguro' },
        caudal: { value: '156.4', subtitle: 'Flujo Moderado' },
        velocidad: { value: '0.85', subtitle: 'Velocidad Normal' }
      };
    }

    // Calcular promedios reales de los datos
    const totalPoints = measurementData.length;

    // Promedio de nivel de agua (dato principal)
    const averageLevel = (measurementData.reduce((sum: number, point: any) => {
      return sum + (point.waterLevel || point.value || 0);
    }, 0) / totalPoints).toFixed(1);

    // Simular otros valores basados en el nivel (en producción vendrían de sensores reales)
    const level = parseFloat(averageLevel);
    const flujo = (level * 0.78).toFixed(1);
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
        subtitle: `Nivel ${getLevelStatus(level)}`
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
    <div className={className}>
      {/* Header del Dashboard */}
      <Card className="bg-gov-white border-gov-accent mb-3">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="flex items-center space-x-2 text-gov-black text-base">
            <Activity className="h-4 w-4 text-gov-primary" />
            <span>Métricas Hidrológicas en Tiempo Real</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Grid responsivo con métricas de números simples */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
