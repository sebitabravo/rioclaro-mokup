import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniTrendChartProps {
  data: any[];
  color: string;
  height?: number;
}

export function MiniTrendChart({ data, color, height = 40 }: MiniTrendChartProps) {
  // Simplificar datos para mini gráfico (solo últimos 8 puntos)
  const simplifiedData = data.slice(-8).map((item, index) => ({
    index,
    value: item.value || 0
  }));

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={simplifiedData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
