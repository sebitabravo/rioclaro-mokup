import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { DataNormalizationService, ChartDataSet, DataSourceType } from "@shared/services/DataNormalizationService";

export type MetricType = 'flujo' | 'nivel' | 'caudal' | 'velocidad' | 'temperatura';

interface MetricChartProps {
  rawData: any[];
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
    chartType: 'bar' as const,
    color: '#1e40af', // var(--primary)
    unit: 'm',
    name: 'Nivel del Agua',
    strokeWidth: 2,
    fillOpacity: 0.8
  },
  caudal: {
    chartType: 'line' as const,
    color: '#7c3aed', // var(--purple)
    unit: 'L/s',
    name: 'Caudal',
    strokeWidth: 3,
    fillOpacity: 1
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
    fillOpacity: 1
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
  // Transformar los datos según el tipo de métrica
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
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gov-white border border-gov-accent rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gov-black mb-1">
            {chartConfig.formatTimestamp(label)}
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
      data: normalizedDataSet.data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
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
        tickFormatter: (value: any) => `${chartConfig.formatValue(value)} ${metricConfig.unit}`
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

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis {...commonAxisProps.xAxisProps} />
            <YAxis {...commonAxisProps.yAxisProps} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar
              dataKey={chartConfig.yAxisKey}
              fill={metricConfig.color}
              opacity={metricConfig.fillOpacity}
              name={metricConfig.name}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
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
              dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: metricConfig.color }}
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
      <div className={className}>
        <div className="flex items-center justify-center h-full text-gov-gray-a">
          Tipo de gráfico no soportado
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {chart}
      </ResponsiveContainer>
    </div>
  );
}
