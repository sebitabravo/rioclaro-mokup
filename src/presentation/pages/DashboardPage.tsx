import { MotionWrapper } from '@shared/components/MotionWrapper';
import { SkipNav } from '@shared/components/accessibility/SkipNav';
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
import { EmergencyAlert } from '@shared/components/ui/EmergencyAlert';
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
      <SkipNav mainId="main-content" />
      <PageLoader
        isLoading={initialLoading}
        title='Río Claro Dashboard'
        subtitle='Cargando datos en tiempo real...'
        aria-live="polite"
        aria-label="Cargando dashboard del sistema de monitoreo"
      />

      <div className='min-h-screen bg-gov-neutral relative overflow-hidden'>
        <GradientOrbs count={1} />
        <WaterRipples count={2} />

        <Navbar />

        <main
          id="main-content"
          className='container mx-auto px-4 py-1 relative z-10'
          role="main"
          aria-label="Dashboard principal del sistema de monitoreo Río Claro"
        >
          <DashboardHeader
            currentTime={currentTime}
            mounted={mounted}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />

          <div
            className='space-y-6'
            data-testid="dashboard-content"
            role="region"
            aria-label="Contenido principal del dashboard"
          >
            <MotionWrapper>
              {/* Emergency Alert - Always show first if there are critical stations */}
              <EmergencyAlert
                criticalCount={stats.criticalStations}
                onViewDetails={() => {
                  // TODO: Navigate to detailed alerts view
                  // Implementation pending
                }}
                className="mb-6"
              />

              <section
                aria-labelledby="metrics-heading"
                role="region"
              >
                <h2 id="metrics-heading" className="sr-only">
                  Métricas del sistema de monitoreo
                </h2>
                <MetricsGrid stats={stats} />
              </section>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <section
                  aria-labelledby="map-heading"
                  role="region"
                >
                  <h2 id="map-heading" className="sr-only">
                    Mapa de estaciones de monitoreo
                  </h2>
                  <StationsMap stations={stations} />
                </section>

                <section
                  aria-labelledby="dashboard-heading"
                  role="region"
                >
                  <h2 id="dashboard-heading" className="sr-only">
                    Gráficos y tendencias de mediciones
                  </h2>
                  <MetricsDashboard measurementData={mockMetricData.map(point => ({
                    timestamp: point.timestamp,
                    value: point.value,
                    water_level: point.waterLevel,
                    station_id: point.stationId,
                    station: point.stationName
                  }))} />
                </section>
              </div>
            </MotionWrapper>
          </div>
        </main>
      </div>
    </>
  );
}