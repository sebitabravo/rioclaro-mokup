import { MotionWrapper } from '@shared/components/MotionWrapper';
import {
  WaterRipples,
  GradientOrbs
} from '@shared/components/ui/background-effects';
import { PageLoader } from '@shared/components/ui/page-loader';
import { Navbar } from '@shared/components/layout/Navbar';
import { DashboardHeader } from '@features/dashboard/components/DashboardHeader';
import { MetricsGrid } from '@features/dashboard/components/MetricsGrid';
import { StationsMap } from '@features/dashboard/components/StationsMap';
import { MetricsDashboard } from '@features/dashboard/components/MetricsDashboard';
import { useDashboardData } from '@features/dashboard/hooks/useDashboardData';

export function DashboardPage() {
  const {
    // State
    refreshing,
    currentTime,
    mounted,
    initialLoading,

    // Data
    stations,
    mockMetricData,
    stats,

    // Actions
    handleRefresh
  } = useDashboardData();

  return (
    <>
      <PageLoader
        isLoading={initialLoading}
        title='Río Claro Dashboard'
        subtitle='Cargando datos en tiempo real...'
      />

      <div className='min-h-screen bg-gov-neutral relative overflow-hidden'>
        <GradientOrbs count={1} />
        <WaterRipples count={2} />

        <Navbar />

        <main className='container mx-auto px-4 py-1 relative z-10'>
          <DashboardHeader
            currentTime={currentTime}
            mounted={mounted}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />

          <MotionWrapper className='space-y-4'>
            <MetricsGrid stats={stats} />

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
              <StationsMap stations={stations} />
              <MetricsDashboard measurementData={mockMetricData as any} />
            </div>
          </MotionWrapper>
        </main>
      </div>
    </>
  );
}