import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DataNormalizationService, ChartDataSet, DataSourceType } from "@shared/services/DataNormalizationService";

interface NormalizedChartProps {
  rawData: any[];
  sourceType: DataSourceType;
  height?: number;
  className?: string;
}

export function NormalizedChart({ rawData, sourceType, height = 300, className = "" }: NormalizedChartProps) {
  const normalizedDataSet: ChartDataSet = DataNormalizationService.normalize(rawData, sourceType);
  const chartConfig = DataNormalizationService.getChartConfig(normalizedDataSet);
  
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={normalizedDataSet.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--gov-accent)" />
          <XAxis
            dataKey={chartConfig.xAxisKey}
            stroke="var(--gov-gray-b)"
            fontSize={12}
            tickFormatter={chartConfig.formatTimestamp}
          />
          <YAxis 
            stroke="var(--gov-gray-b)" 
            fontSize={12}
            tickFormatter={(value) => chartConfig.formatValue(value)}
          />
          <Tooltip
            labelFormatter={(value) => `Hora: ${chartConfig.formatTimestamp(value as string)}`}
            formatter={(value: any) => [
              chartConfig.formatValue(value), 
              normalizedDataSet.metadata.type.charAt(0).toUpperCase() + normalizedDataSet.metadata.type.slice(1)
            ]}
            contentStyle={{
              backgroundColor: "var(--gov-white)",
              border: "1px solid var(--gov-accent)",
              borderRadius: "8px",
            }}
          />
          <Line
            type="monotone"
            dataKey={chartConfig.yAxisKey}
            stroke={chartConfig.color}
            strokeWidth={chartConfig.strokeWidth || 2}
            dot={{ 
              fill: chartConfig.color, 
              strokeWidth: 2, 
              r: chartConfig.dotRadius || 4 
            }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Metadata info */}
      <div className="mt-2 text-xs text-gov-gray-b flex justify-between">
        <span>Fuente: {normalizedDataSet.metadata.source}</span>
        <span>
          Rango: {normalizedDataSet.metadata.range?.min.toFixed(2)} - {normalizedDataSet.metadata.range?.max.toFixed(2)} {normalizedDataSet.metadata.unit}
        </span>
      </div>
    </div>
  );
}