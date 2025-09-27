export interface MetricDataPoint {
  timestamp: string;
  value: number;
  stationName: string;
  stationId: number;
  metricType: string;
  waterLevel: number;
  flow: number;
  flowRate: number;
  velocity: number;
}

export interface StationStats {
  totalStations: number;
  activeStations: number;
  criticalStations: number;
  averageLevel: number;
}

export class MockDataService {
  static generateMetricData(hoursBack: number = 24): MetricDataPoint[] {
    const now = new Date();
    const data: MetricDataPoint[] = [];
    const pointsCount = Math.min(hoursBack / 2, 12);

    for (let i = pointsCount - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);
      const hour = pointsCount - 1 - i;
      const baseTime = hour / pointsCount;

      const waterLevel = 2.5 + Math.sin(baseTime * Math.PI * 2) * 0.8 + Math.random() * 0.3;
      const flow = 14 + Math.sin(baseTime * Math.PI * 1.5) * 4 + Math.random() * 2;
      const flowRate = 1000 + Math.sin(baseTime * Math.PI * 2.5) * 300 + Math.random() * 100;
      const velocity = 1.5 + Math.sin(baseTime * Math.PI * 3) * 0.8 + Math.random() * 0.3;

      data.push({
        timestamp: timestamp.toISOString(),
        value: waterLevel,
        stationName: 'Río Claro Sur',
        stationId: 1,
        metricType: 'waterLevel',
        waterLevel,
        flow,
        flowRate,
        velocity
      });
    }

    return data;
  }

  static generateStationStats(): StationStats {
    return {
      totalStations: 12,
      activeStations: 10,
      criticalStations: 2,
      averageLevel: 2.3 + Math.random() * 0.4
    };
  }

  static generateMetricsByType(metricType: 'waterLevel' | 'flow' | 'flowRate' | 'velocity'): MetricDataPoint[] {
    const baseData = this.generateMetricData();
    return baseData.map(point => ({
      ...point,
      metricType,
      value: point[metricType]
    }));
  }
}