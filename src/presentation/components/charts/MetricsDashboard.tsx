import { Card, CardContent, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { MetricChart, MetricType } from "./MetricChart";
import { DataSourceType } from "@shared/services/DataNormalizationService";
import { BarChart3, Activity, Waves, Droplets, Gauge } from "lucide-react";

interface MetricsDashboardProps {
  measurementData: any[];
  className?: string;
}

const METRIC_DEFINITIONS = [
  {
    id: 'flujo' as MetricType,
    name: 'Flujo de Agua',
    description: 'Volumen de agua que pasa por un punto en m³/s',
    icon: Waves,
    color: 'text-gov-green'
  },
  {
    id: 'nivel' as MetricType,
    name: 'Nivel del Agua',
    description: 'Altura del agua medida desde el punto de referencia',
    icon: BarChart3,
    color: 'text-gov-primary'
  },
  {
    id: 'caudal' as MetricType,
    name: 'Caudal',
    description: 'Cantidad de agua que fluye por unidad de tiempo en L/s',
    icon: Droplets,
    color: 'text-purple-600'
  },
  {
    id: 'velocidad' as MetricType,
    name: 'Velocidad del Flujo',
    description: 'Velocidad promedio del agua en m/s',
    icon: Gauge,
    color: 'text-gov-secondary'
  }
];

export function MetricsDashboard({ measurementData, className = "" }: MetricsDashboardProps) {
  return (
    <div className={className}>
      {/* Header del Dashboard */}
      <Card className="bg-gov-white border-gov-accent mb-3">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="flex items-center space-x-2 text-gov-black text-base">
            <Activity className="h-4 w-4 text-gov-primary" />
            <span>Métricas Hidrológicas - Últimas 24h</span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Grid 2x2 con todas las métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {METRIC_DEFINITIONS.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <Card key={metric.id} className="bg-gov-white border-gov-accent">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="flex items-center space-x-2 text-gov-black text-sm">
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <span>{metric.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="w-full bg-gray-50 rounded-lg p-2">
                  <MetricChart
                    rawData={measurementData}
                    sourceType={DataSourceType.MEASUREMENT}
                    metricType={metric.id}
                    height={180}
                    showLegend={false}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
