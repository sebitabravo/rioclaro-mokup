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
    initialLoading,
    autoRefreshEnabled,
    lastUpdated,

    // Data
    stations,
    mockMetricData,
    stats,

    // Actions
    handleRefresh,
    toggleAutoRefresh
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
          className='container mx-auto px-4 py-6 relative z-10 max-w-7xl'
          role="main"
          aria-label="Dashboard principal del sistema de monitoreo Río Claro"
        >
          {/* Header Section */}
          <div className="mb-8">
            <DashboardHeader
              refreshing={refreshing}
              autoRefreshEnabled={autoRefreshEnabled}
              lastUpdated={lastUpdated}
              onRefresh={handleRefresh}
              onToggleAutoRefresh={toggleAutoRefresh}
            />
          </div>

          <div
            className='space-y-8'
            data-testid="dashboard-content"
            role="region"
            aria-label="Contenido principal del dashboard"
          >
            <MotionWrapper>
              {/* Emergency Alert Section */}
              {stats.criticalStations > 0 && (
                <div className="mb-8">
                  <EmergencyAlert
                    criticalCount={stats.criticalStations}
                    onViewDetails={() => {
                      // TODO: Navigate to detailed alerts view
                      // Implementation pending
                    }}
                  />
                </div>
              )}

              {/* Metrics Grid Section */}
              <section
                aria-labelledby="metrics-heading"
                role="region"
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 id="metrics-heading" className="text-2xl font-bold text-gov-black mb-2">
                      Métricas del Sistema
                    </h2>
                    <p className="text-gov-gray-a">
                      Resumen en tiempo real del estado de las estaciones de monitoreo
                    </p>
                  </div>
                </div>
                <MetricsGrid stats={stats} />
              </section>

              {/* Main Content Grid */}
              <div className='grid grid-cols-1 xl:grid-cols-5 gap-8'>
                {/* Map Section */}
                <section
                  aria-labelledby="map-heading"
                  role="region"
                  className="xl:col-span-3"
                >
                  <div className="mb-6">
                    <h2 id="map-heading" className="text-xl font-bold text-gov-black mb-2">
                      Ubicación de Estaciones
                    </h2>
                    <p className="text-sm text-gov-gray-a">
                      Visualización geográfica de las estaciones de monitoreo activas
                    </p>
                  </div>
                  <div className="bg-gov-white rounded-lg border border-gov-accent shadow-sm overflow-hidden">
                    <StationsMap stations={stations} />
                  </div>
                </section>

                {/* Dashboard Metrics Section */}
                <section
                  aria-labelledby="dashboard-heading"
                  role="region"
                  className="xl:col-span-2"
                >
                  <div className="mb-6">
                    <h2 id="dashboard-heading" className="text-xl font-bold text-gov-black mb-2">
                      Tendencias de Mediciones
                    </h2>
                    <p className="text-sm text-gov-gray-a">
                      Gráficos y análisis de los niveles de agua recientes
                    </p>
                  </div>
                  <div className="bg-gov-white rounded-lg border border-gov-accent shadow-sm">
                    <MetricsDashboard measurementData={mockMetricData.map(point => ({
                      timestamp: point.timestamp,
                      value: point.value,
                      water_level: point.waterLevel,
                      station_id: point.stationId,
                      station: point.stationName
                    }))} />
                  </div>
                </section>
              </div>

              {/* Additional Information Section */}
              <section className="mt-12 bg-gov-white rounded-lg border border-gov-accent shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gov-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gov-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gov-black mb-1">Actualizaciones Automáticas</h3>
                      <p className="text-sm text-gov-gray-a">
                        Los datos se actualizan cada 5 minutos para mantener información precisa y en tiempo real.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gov-green/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gov-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gov-black mb-1">Monitoreo Confiable</h3>
                      <p className="text-sm text-gov-gray-a">
                        Sistema de sensores calibrados con precisión para garantizar mediciones exactas del nivel del agua.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gov-orange/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gov-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.734 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gov-black mb-1">Alertas Inteligentes</h3>
                      <p className="text-sm text-gov-gray-a">
                        Notificaciones automáticas cuando los niveles superan los umbrales críticos establecidos.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </MotionWrapper>
          </div>
        </main>
      </div>
    </>
  );
}