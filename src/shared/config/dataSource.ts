export type DataSourceMode = 'MOCK' | 'API';

const MOCK_ALIASES = new Set(['MOCK', 'DEMO', 'MOCKUP']);
const API_ALIASES = new Set(['API', 'PROD', 'PRODUCTION']);

function normalizeValue(value?: string): string {
  return (value ?? '').trim().toUpperCase();
}

export function resolveDataSourceMode(rawValue?: string): DataSourceMode {
  const normalized = normalizeValue(rawValue);

  if (MOCK_ALIASES.has(normalized)) {
    return 'MOCK';
  }

  if (API_ALIASES.has(normalized)) {
    return 'API';
  }

  return 'MOCK';
}

export function resolveEnvironmentMode(rawValue?: string): 'development' | 'production' {
  const normalized = normalizeValue(rawValue);
  return normalized === 'PRODUCTION' ? 'production' : 'development';
}

export function getRuntimeDataSourceConfig() {
  const environment = resolveEnvironmentMode(import.meta.env.VITE_ENVIRONMENT ?? import.meta.env.MODE);
  const dataSource = resolveDataSourceMode(import.meta.env.VITE_DATA_SOURCE);

  return {
    environment,
    dataSource,
    isProduction: environment === 'production',
    useMock: dataSource === 'MOCK',
  };
}
