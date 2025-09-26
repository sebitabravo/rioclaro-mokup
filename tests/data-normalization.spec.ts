import { test, expect } from '@playwright/test';
import { DataNormalizationService, DataSourceType } from '../src/shared/services/DataNormalizationService';

test.describe('DataNormalizationService', () => {
  test('normalize report data (happy path)', () => {
    const raw = [
      { timestamp: '2025-01-07T12:00:00Z', value: 2.1, date: '2025-01-07', average_level: '2.1' },
      { timestamp: '2025-01-08T12:00:00Z', value: '2.3', date: '2025-01-08' },
      { date: '2025-01-09', average_level: 2.8 }
    ];

    const ds = DataNormalizationService.normalize(raw as Record<string, unknown>[], DataSourceType.REPORT);
    expect(ds).toBeTruthy();
    expect(ds.metadata.source).toBe('reports');
    expect(ds.data.length).toBe(3);
    expect(ds.data[0].value).toBeCloseTo(2.1, 5);
    expect(typeof ds.data[0].timestamp).toBe('string');
  });

  test('normalize report with missing/invalid values falls back to 0 or numeric parse', () => {
    const raw = [
      { date: '2025-01-10', average_level: '3.2' },
      { date: '2025-01-11', value: null },
      { date: '2025-01-12', max_level: undefined }
    ];

    const ds = DataNormalizationService.normalize(raw as Record<string, unknown>[], DataSourceType.REPORT);
    expect(ds.data.length).toBe(3);
    expect(ds.data[0].value).toBeCloseTo(3.2, 5);
    expect(ds.data[1].value).toBe(0);
    expect(ds.data[2].value).toBe(0);
  });

  test('normalize json with flexible key names', () => {
    const raw = [
      { fecha: '2025-02-01T08:00:00Z', nivel: '2.5', estacion: 'A' },
      { time: '2025-02-01T09:00:00Z', measurement: 3.1 }
    ];

    const ds = DataNormalizationService.normalize(raw as Record<string, unknown>[], DataSourceType.JSON);
    expect(ds.data.length).toBe(2);
    expect(ds.metadata.source).toBe('json_import');
    expect(ds.data[0].value).toBeCloseTo(2.5, 5);
  });

  test('normalize api_v2 mapping', () => {
    const raw = [
      { datetime: '2025-03-01T10:00:00Z', water_height: '1.7', sensor_name: 'S1' }
    ];

    const ds = DataNormalizationService.normalize(raw as Record<string, unknown>[], DataSourceType.API_V2);
    expect(ds.data.length).toBe(1);
    expect(ds.metadata.source).toBe('external_api_v2');
    expect(ds.data[0].value).toBeCloseTo(1.7, 5);
  });
});
