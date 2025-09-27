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
import { HydrologicMetricsGrid } from '@features/dashboard/components/HydrologicMetricsGrid';
import { StationsMap } from '@features/dashboard/components/StationsMap';
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
          className='container mx-auto px-4 py-6 relative z-10'
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
            className='space-y-8'
            data-testid="dashboard-content"
            role="region"
            aria-label="Contenido principal del dashboard"
          >
            <MotionWrapper>


              <section
                aria-labelledby="metrics-heading"
                role="region"
                className="mb-8 space-y-6"
              >
                <h2 id="metrics-heading" className="sr-only">
                  Métricas del sistema de monitoreo
                </h2>
                <MetricsGrid stats={stats} />
                <HydrologicMetricsGrid measurementData={mockMetricData.map(point => ({
                  timestamp: point.timestamp,
                  value: point.value,
                  water_level: point.waterLevel,
                  station_id: point.stationId,
                  station: point.stationName
                }))} />
              </section>

              <section
                aria-labelledby="map-heading"
                role="region"
                className="mb-8"
              >
                <h2 id="map-heading" className="sr-only">
                  Mapa de estaciones de monitoreo
                </h2>
                <div className="h-[600px] w-full">
                  <StationsMap stations={stations} />
                </div>
              </section>

              <section
                aria-labelledby="dashboard-heading"
                role="region"
              >
                <h2 id="dashboard-heading" className="sr-only">
                  Gráficos y tendencias de mediciones
                </h2>
                <div className="bg-gov-white border border-gov-accent rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gov-black mb-4">
                    Tendencias y Análisis
                  </h3>
                  <p className="text-gov-muted-foreground">
                    Los gráficos de tendencias estarán disponibles próximamente con datos históricos del sensor ultrasónico.
                  </p>
                </div>
              </section>
            </MotionWrapper>
          </div>
        </main>
      </div>
      
      {/* Emergency Alert - Fixed overlay */}
      {stats.criticalStations > 0 && (
        <div 
          className="fixed top-4 right-4 z-50 max-w-sm"
          style={{ position: 'fixed' }}
        >
          <EmergencyAlert
            criticalCount={stats.criticalStations}
            onViewDetails={() => {
              // TODO: Navigate to detailed alerts view
              // Implementation pending
            }}
            className="shadow-2xl border-2 border-red-200"
          />
        </div>
      )}
    </>
  );
}