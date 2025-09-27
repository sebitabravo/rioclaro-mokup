import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { DataNormalizationService, ChartDataSet, DataSourceType } from "@shared/services/DataNormalizationService";

export type MetricType = 'flujo' | 'nivel' | 'caudal' | 'velocidad' | 'temperatura';

interface MetricChartProps {
  rawData: Record<string, unknown>[];
  sourceType: DataSourceType;
  metricType: MetricType;
  height?: number;
  className?: string;
  showLegend?: boolean;
}

// Configuraciones específicas por tipo de métrica
const METRIC_CONFIGS = {
  flujo: {
    chartType: 'area' as const,
    color: '#16a34a', // var(--green)
    gradientColor: '#16a34a',
    unit: 'm³/s',
    name: 'Flujo de Agua',
    strokeWidth: 3,
    fillOpacity: 0.3
  },
  nivel: {
    chartType: 'line' as const,
    color: '#1e40af', // var(--primary)
    unit: 'm',
    name: 'Nivel del Agua',
    strokeWidth: 6,
    fillOpacity: 0.8,
    dotSize: 8
  },
  caudal: {
    chartType: 'line' as const,
    color: '#7c3aed', // var(--purple)
    unit: 'L/s',
    name: 'Caudal',
    strokeWidth: 3,
    fillOpacity: 1,
    dotSize: 4
  },
  velocidad: {
    chartType: 'area' as const,
    color: '#ea580c', // var(--orange)
    gradientColor: '#ea580c',
    unit: 'm/s',
    name: 'Velocidad',
    strokeWidth: 2,
    fillOpacity: 0.2
  },
  temperatura: {
    chartType: 'line' as const,
    color: '#dc2626', // var(--secondary)
    unit: '°C',
    name: 'Temperatura',
    strokeWidth: 2,
    fillOpacity: 1,
    dotSize: 4
  }
} as const;

export function MetricChart({
  rawData,
  sourceType,
  metricType,
  height = 300,
  className = "",
  showLegend = false
}: MetricChartProps) {
  // Transform data according to metric type
  const transformedData = rawData.map(item => {
    let value;
    switch (metricType) {
      case 'flujo':
        value = item.flow || item.flujo || item.value || 0;
        break;
      case 'nivel':
        value = item.water_level || item.nivel || item.value || 0;
        break;
      case 'caudal':
        value = item.flow_rate || item.caudal || item.value || 0;
        break;
      case 'velocidad':
        value = item.velocity || item.velocidad || item.value || 0;
        break;
      case 'temperatura':
        value = item.temperature || item.temperatura || item.value || 20 + Math.random() * 5;
        break;
      default:
        value = item.value || 0;
    }

    return {
      ...item,
      value: value
    };
  });

  const normalizedDataSet: ChartDataSet = DataNormalizationService.normalize(transformedData, sourceType);
  const chartConfig = DataNormalizationService.getChartConfig(normalizedDataSet);
  const metricConfig = METRIC_CONFIGS[metricType];

  // If no data, render placeholder
  if (!rawData || rawData.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gov-white rounded-lg border border-gov-accent shadow-sm ${className}`}
        style={{ height }}
        data-testid="metric-chart"
      >
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gov-accent flex items-center justify-center">
            <svg className="w-6 h-6 text-gov-gray-a" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gov-gray-a text-center max-w-xs">
            No hay datos disponibles para la métrica seleccionada
          </p>
        </div>
      </div>
    );
  }

  // Ensure data items have string timestamps and numeric values
  const safeData = normalizedDataSet.data.map(d => ({
    ...d,
    timestamp: String(d.timestamp),
    value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0
  }));

  // Custom Tooltip
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; [key: string]: unknown }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gov-white border border-gov-accent rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gov-black mb-1">
            {chartConfig.formatTimestamp(label || '')}
          </p>
          <div className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metricConfig.color }}
            />
            <span className="text-sm text-gov-gray-a">{metricConfig.name}:</span>
            <span className="text-sm font-bold text-gov-black">
              {chartConfig.formatValue(payload[0].value)} {metricConfig.unit}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: safeData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    const commonAxisProps = {
      xAxisProps: {
        dataKey: chartConfig.xAxisKey,
        stroke: "#94a3b8", // var(--gray-b)
        fontSize: 12,
        tickFormatter: chartConfig.formatTimestamp
      },
      yAxisProps: {
        stroke: "#94a3b8", // var(--gray-b)
        fontSize: 12,
        tickFormatter: (value: number) => `${chartConfig.formatValue(value)} ${metricConfig.unit}`
      }
    };

    switch (metricConfig.chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metricConfig.gradientColor} stopOpacity={metricConfig.fillOpacity} />
                <stop offset="95%" stopColor={metricConfig.gradientColor} stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis {...commonAxisProps.xAxisProps} />
            <YAxis {...commonAxisProps.yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={chartConfig.yAxisKey}
              stroke={metricConfig.color}
              strokeWidth={metricConfig.strokeWidth}
              fill={`url(#gradient-${metricType})`}
              name={metricConfig.name}
            />
          </AreaChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis {...commonAxisProps.xAxisProps} />
            <YAxis {...commonAxisProps.yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={chartConfig.yAxisKey}
              stroke={metricConfig.color}
              strokeWidth={metricConfig.strokeWidth}
              dot={{
                fill: metricConfig.color,
                strokeWidth: 2,
                r: 'dotSize' in metricConfig ? metricConfig.dotSize : 4
              }}
              activeDot={{
                r: ('dotSize' in metricConfig ? metricConfig.dotSize : 4) + 2,
                fill: metricConfig.color
              }}
              name={metricConfig.name}
            />
          </LineChart>
        );

      default:
        return null;
    }
  };

  const chart = renderChart();

  if (!chart) {
    return (
      <div className={`flex items-center justify-center bg-gov-white rounded-lg border border-gov-accent shadow-sm ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-gov-accent flex items-center justify-center">
            <svg className="w-6 h-6 text-gov-gray-a" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.734 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
            </svg>
          </div>
          <p className="text-sm text-gov-gray-a text-center max-w-xs">
            Tipo de gráfico no soportado
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gov-white rounded-lg border border-gov-accent shadow-sm ${className}`} data-testid="metric-chart">
      <div className="w-full p-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
    </div>
  );
}