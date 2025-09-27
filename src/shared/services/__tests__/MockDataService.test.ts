import { describe, it, expect, beforeEach } from 'vitest';
import { MockDataService, type StationStats } from '../MockDataService';

describe('MockDataService', () => {
  describe('generateMetricData', () => {
    it('should generate default 12 data points for 24 hours', () => {
      const data = MockDataService.generateMetricData();

      expect(data).toHaveLength(12);
      expect(data[0]).toMatchObject({
        timestamp: expect.any(String),
        value: expect.any(Number),
        stationName: 'Río Claro Sur',
        stationId: 1,
        metricType: 'waterLevel',
        waterLevel: expect.any(Number),
        flow: expect.any(Number),
        flowRate: expect.any(Number),
        velocity: expect.any(Number)
      });
    });

    it('should generate custom number of points based on hoursBack', () => {
      const data = MockDataService.generateMetricData(12);
      expect(data).toHaveLength(6); // 12 hours / 2 = 6 points
    });

    it('should generate realistic water level values between 1.7 and 3.6', () => {
      const data = MockDataService.generateMetricData();

      data.forEach(point => {
        expect(point.waterLevel).toBeGreaterThanOrEqual(1.7);
        expect(point.waterLevel).toBeLessThanOrEqual(3.6);
      });
    });

    it('should generate realistic flow values between 10 and 20', () => {
      const data = MockDataService.generateMetricData();

      data.forEach(point => {
        expect(point.flow).toBeGreaterThanOrEqual(10);
        expect(point.flow).toBeLessThanOrEqual(20);
      });
    });

    it('should generate timestamps in chronological order', () => {
      const data = MockDataService.generateMetricData();

      for (let i = 1; i < data.length; i++) {
        const prevTime = new Date(data[i - 1].timestamp);
        const currentTime = new Date(data[i].timestamp);
        expect(currentTime.getTime()).toBeGreaterThan(prevTime.getTime());
      }
    });

    it('should generate valid ISO timestamp strings', () => {
      const data = MockDataService.generateMetricData();

      data.forEach(point => {
        expect(() => new Date(point.timestamp)).not.toThrow();
        expect(new Date(point.timestamp).toISOString()).toBe(point.timestamp);
      });
    });

    it('should set value equal to waterLevel', () => {
      const data = MockDataService.generateMetricData();

      data.forEach(point => {
        expect(point.value).toBe(point.waterLevel);
      });
    });
  });

  describe('generateStationStats', () => {
    let stats: StationStats;

    beforeEach(() => {
      stats = MockDataService.generateStationStats();
    });

    it('should generate valid station stats structure', () => {
      expect(stats).toMatchObject({
        totalStations: expect.any(Number),
        activeStations: expect.any(Number),
        criticalStations: expect.any(Number),
        averageLevel: expect.any(Number)
      });
    });

    it('should have 12 total stations', () => {
      expect(stats.totalStations).toBe(12);
    });

    it('should have 10 active stations', () => {
      expect(stats.activeStations).toBe(10);
    });

    it('should have 2 critical stations', () => {
      expect(stats.criticalStations).toBe(2);
    });

    it('should have activeStations <= totalStations', () => {
      expect(stats.activeStations).toBeLessThanOrEqual(stats.totalStations);
    });

    it('should have criticalStations <= totalStations', () => {
      expect(stats.criticalStations).toBeLessThanOrEqual(stats.totalStations);
    });

    it('should generate realistic average level between 2.3 and 2.7', () => {
      expect(stats.averageLevel).toBeGreaterThanOrEqual(2.3);
      expect(stats.averageLevel).toBeLessThanOrEqual(2.7);
    });
  });

  describe('generateMetricsByType', () => {
    it('should generate waterLevel metrics correctly', () => {
      const data = MockDataService.generateMetricsByType('waterLevel');

      data.forEach(point => {
        expect(point.metricType).toBe('waterLevel');
        expect(point.value).toBe(point.waterLevel);
      });
    });

    it('should generate flow metrics correctly', () => {
      const data = MockDataService.generateMetricsByType('flow');

      data.forEach(point => {
        expect(point.metricType).toBe('flow');
        expect(point.value).toBe(point.flow);
      });
    });

    it('should generate flowRate metrics correctly', () => {
      const data = MockDataService.generateMetricsByType('flowRate');

      data.forEach(point => {
        expect(point.metricType).toBe('flowRate');
        expect(point.value).toBe(point.flowRate);
      });
    });

    it('should generate velocity metrics correctly', () => {
      const data = MockDataService.generateMetricsByType('velocity');

      data.forEach(point => {
        expect(point.metricType).toBe('velocity');
        expect(point.value).toBe(point.velocity);
      });
    });

    it('should generate same length regardless of metric type', () => {
      const waterLevel = MockDataService.generateMetricsByType('waterLevel');
      const flow = MockDataService.generateMetricsByType('flow');
      const flowRate = MockDataService.generateMetricsByType('flowRate');
      const velocity = MockDataService.generateMetricsByType('velocity');

      expect(waterLevel).toHaveLength(12);
      expect(flow).toHaveLength(12);
      expect(flowRate).toHaveLength(12);
      expect(velocity).toHaveLength(12);
    });
  });

  describe('data consistency', () => {
    it('should generate different data on multiple calls', () => {
      const data1 = MockDataService.generateMetricData();
      const data2 = MockDataService.generateMetricData();

      // Los valores deberían ser diferentes debido a Math.random()
      const values1 = data1.map(d => d.waterLevel);
      const values2 = data2.map(d => d.waterLevel);

      expect(values1).not.toEqual(values2);
    });

    it('should maintain data structure integrity across calls', () => {
      for (let i = 0; i < 5; i++) {
        const data = MockDataService.generateMetricData();

        expect(data).toHaveLength(12);
        expect(data[0]).toHaveProperty('timestamp');
        expect(data[0]).toHaveProperty('value');
        expect(data[0]).toHaveProperty('stationName');
        expect(data[0]).toHaveProperty('stationId');
        expect(data[0]).toHaveProperty('metricType');
        expect(data[0]).toHaveProperty('waterLevel');
        expect(data[0]).toHaveProperty('flow');
        expect(data[0]).toHaveProperty('flowRate');
        expect(data[0]).toHaveProperty('velocity');
      }
    });
  });
});