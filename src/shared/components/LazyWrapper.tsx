import { lazy, Suspense, ComponentType } from 'react';
import { PageLoader } from './ui/page-loader';
import { useGovernmentDeviceOptimization } from '../hooks/useDeviceOptimization';

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  loadingTitle?: string;
  loadingSubtitle?: string;
}

// Higher-order component for lazy loading with government optimization
export function withLazyLoading<T extends object>(
  componentImporter: () => Promise<{ default: ComponentType<T> }>,
  options?: LazyWrapperProps
) {
  const LazyComponent = lazy(componentImporter);

  return function LazyLoadedComponent(props: T) {
    const { shouldLazyLoad } = useGovernmentDeviceOptimization();

    const fallback = options?.fallback || (
      <PageLoader
        isLoading={true}
        title={options?.loadingTitle || 'Cargando componente...'}
        subtitle={options?.loadingSubtitle || 'Optimizando para su dispositivo...'}
      />
    );

    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Government-optimized lazy loading utilities
export const LazyMap = withLazyLoading(
  () => import('../../features/dashboard/components/StationsMap'),
  {
    loadingTitle: 'Cargando mapa...',
    loadingSubtitle: 'Preparando visualización geográfica...'
  }
);

export const LazyCharts = withLazyLoading(
  () => import('../../features/dashboard/components/MetricsDashboard'),
  {
    loadingTitle: 'Cargando gráficos...',
    loadingSubtitle: 'Procesando datos estadísticos...'
  }
);

export const LazyReports = withLazyLoading(
  () => import('../../presentation/pages/ReportsPage'),
  {
    loadingTitle: 'Cargando análisis...',
    loadingSubtitle: 'Preparando herramientas de reportes...'
  }
);

export const LazyAdmin = withLazyLoading(
  () => import('../../presentation/pages/AdminPage'),
  {
    loadingTitle: 'Cargando administración...',
    loadingSubtitle: 'Verificando permisos de acceso...'
  }
);

export const LazyActivity = withLazyLoading(
  () => import('../../presentation/pages/ActivityReportPage'),
  {
    loadingTitle: 'Cargando actividad...',
    loadingSubtitle: 'Compilando registros del sistema...'
  }
);