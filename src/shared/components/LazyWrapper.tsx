import { lazy, Suspense } from 'react';
import { PageLoader } from './ui/page-loader';

// Government-optimized lazy loading utilities with custom fallbacks
export const LazyMap = lazy(() => 
  import('../../features/dashboard/components/StationsMap').then(module => ({
    default: module.StationsMap
  }))
);

export const LazyCharts = lazy(() => 
  import('../../features/dashboard/components/MetricsDashboard').then(module => ({
    default: module.MetricsDashboard
  }))
);

export const LazyReports = lazy(() => 
  import('../../presentation/pages/ReportsPage').then(module => ({
    default: module.ReportsPage
  }))
);

export const LazyAdmin = lazy(() => 
  import('../../presentation/pages/AdminPage').then(module => ({
    default: module.AdminPage
  }))
);

export const LazyActivity = lazy(() => 
  import('../../presentation/pages/ActivityReportPage').then(module => ({
    default: module.ActivityReportPage
  }))
);

// Wrapper component for consistent loading states
interface LazyWrapperProps {
  children: React.ReactNode;
  loadingTitle?: string;
  loadingSubtitle?: string;
  fallback?: React.ReactNode;
}

export function LazyWrapper({ 
  children, 
  loadingTitle = 'Cargando componente...', 
  loadingSubtitle = 'Optimizando para su dispositivo...',
  fallback 
}: LazyWrapperProps) {
  const defaultFallback = (
    <PageLoader
      isLoading={true}
      title={loadingTitle}
      subtitle={loadingSubtitle}
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}