import { useState, useEffect } from 'react';
import { useStationStore } from '@features/admin/stores/StationStore';
import { useMeasurementStore } from '@features/dashboard/stores/MeasurementStore';
import type { MetricDataPoint } from '@shared/types/data-types';

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
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { stations, fetchStations } = useStationStore();
  const { measurements, fetchLatestMeasurements } = useMeasurementStore();

  const metricData = measurements.length > 0
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
    : [];

  const stats: DashboardStats = {
    totalStations: stations.length || 0,
    activeStations: stations.filter(s => s.status === 'active').length || 0,
    criticalStations: stations.filter(s => s.current_level > s.threshold).length || 0,
    averageLevel: metricData.length > 0
      ? metricData.reduce((sum, point) => sum + point.waterLevel, 0) / metricData.length
      : 0
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchStations(), fetchLatestMeasurements()]);
      setLastUpdated(new Date());
    } finally {
      setTimeout(() => setRefreshing(false), 200);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
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
        setLastUpdated(new Date());
      } finally {
        setInitialLoading(false);
      }
    };

    initializeDashboard();

    // Actualizar hora cada minuto
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [fetchStations, fetchLatestMeasurements]);

  // Auto-refresh de datos cada 30 segundos
  useEffect(() => {
    if (!autoRefreshEnabled || initialLoading) return;

    const refreshInterval = setInterval(async () => {
      // Auto-refresh ejecutado
      try {
        await Promise.all([fetchStations(), fetchLatestMeasurements()]);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error en auto-refresh:', error);
      }
    }, 30000); // 30 segundos

    return () => clearInterval(refreshInterval);
  }, [autoRefreshEnabled, initialLoading, fetchStations, fetchLatestMeasurements]);

  return {
    // State
    refreshing,
    currentTime,
    mounted,
    initialLoading,
    autoRefreshEnabled,
    lastUpdated,

    // Data
    stations,
    measurements,
    metricData,
    stats,

    // Actions
    handleRefresh,
    toggleAutoRefresh
  };
}