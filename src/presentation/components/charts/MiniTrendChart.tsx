import { LineChart, Line, ResponsiveContainer, Area, AreaChart } from "recharts";
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface MiniTrendChartProps {
  data: any[];
  color: string;
  height?: number;
  animated?: boolean;
  type?: 'line' | 'area';
}

export function MiniTrendChart({ 
  data, 
  color, 
  height = 40, 
  animated = true, 
  type = 'line' 
}: MiniTrendChartProps) {
  const [animatedData, setAnimatedData] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Simplificar datos para mini gráfico (solo últimos 8 puntos)
  const simplifiedData = data.slice(-8).map((item, index) => ({
    index,
    value: item.value || 0
  }));

  useEffect(() => {
    if (!animated) {
      setAnimatedData(simplifiedData);
      return;
    }

    // Reset animation data when data changes
    setAnimatedData([]);
    
    // Animación progresiva de datos
    const timer = setTimeout(() => {
      setIsVisible(true);
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < simplifiedData.length) {
          setAnimatedData(prev => [...prev, simplifiedData[currentIndex]]);
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50); // 50ms entre cada punto

      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(timer);
  }, [data, animated, simplifiedData.length]);

  const chartData = animated ? animatedData : simplifiedData;

  return (
    <motion.div 
      style={{ width: '100%', height: `${height}px` }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color.replace('#', '')})`}
              animationDuration={animated ? 1500 : 300}
              animationBegin={0}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              animationDuration={animated ? 1500 : 300}
              animationBegin={0}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
