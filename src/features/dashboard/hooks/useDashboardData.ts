import { useState, useEffect } from 'react';
import { useStationStore } from '@features/admin/stores/StationStore';
import { useMeasurementStore } from '@features/dashboard/stores/MeasurementStore';
import { MockDataService, type MetricDataPoint } from '@shared/services/MockDataService';

export interface DashboardStats {
  totalStations: number;
  activeStations: number;
  criticalStations: number;
  averageLevel: number;
}

export function useDashboardData() {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { stations, fetchStations } = useStationStore();
  const { measurements, fetchLatestMeasurements } = useMeasurementStore();

  const mockMetricData = measurements.length > 0
    ? measurements.map(m => ({
        timestamp: m.timestamp,
        value: m.value,
        stationName: stations.find(s => s.id === m.station_id)?.name || 'Unknown',
        stationId: m.station_id,
        metricType: 'waterLevel',
        waterLevel: m.value,
        flow: 0,
        flowRate: 0,
        velocity: 0
      })) as MetricDataPoint[]
    : MockDataService.generateMetricData();

  const stats: DashboardStats = {
    totalStations: stations.length || 12,
    activeStations: stations.filter(s => s.status === 'active').length || 10,
    criticalStations: stations.filter(s => s.current_level > s.threshold).length || 2,
    averageLevel: mockMetricData.length > 0
      ? mockMetricData.reduce((sum, point) => sum + point.waterLevel, 0) / mockMetricData.length
      : 2.3
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchStations(), fetchLatestMeasurements()]);
    } finally {
      setTimeout(() => setRefreshing(false), 200);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setMounted(true);
      setCurrentTime(new Date());

      const loadingPromise = new Promise((resolve) => setTimeout(resolve, 50));

      try {
        await Promise.all([
          fetchStations(),
          fetchLatestMeasurements(),
          loadingPromise
        ]);
      } finally {
        setInitialLoading(false);
      }
    };

    initializeDashboard();

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchStations, fetchLatestMeasurements]);

  return {
    // State
    refreshing,
    currentTime,
    mounted,
    initialLoading,

    // Data
    stations,
    measurements,
    mockMetricData,
    stats,

    // Actions
    handleRefresh
  };
}