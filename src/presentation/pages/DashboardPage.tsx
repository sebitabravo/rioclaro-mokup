import { useEffect, useState } from "react";
import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { RefreshCw, Activity, MapPin, AlertTriangle, TrendingUp, Droplets } from "lucide-react";
import { useStationStore } from "@presentation/stores/StationStore";
import { useMeasurementStore } from "@presentation/stores/MeasurementStore";
import { formatDateTime, formatWaterLevel } from "@shared/utils/formatters";
import { NormalizedChart } from "@presentation/components/charts/NormalizedChart";
import { DataSourceType } from "@shared/services/DataNormalizationService";

export function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  const { stations, fetchStations } = useStationStore();
  const { latestMeasurements, fetchLatestMeasurements } = useMeasurementStore();

  const stats = {
    total_stations: stations.length,
    active_stations: stations.filter((s) => s.status === "active").length,
    average_level: stations.length > 0 ? stations.reduce((sum, s) => sum + s.current_level, 0) / stations.length : 0,
    critical_stations: stations.filter((s) => s.current_level > s.threshold).length,
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchStations(),
      fetchLatestMeasurements()
    ]);
    setCurrentTime(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    
    // Cargar datos iniciales
    fetchStations();
    fetchLatestMeasurements();
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchStations, fetchLatestMeasurements]);

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />

      <main className="container mx-auto px-4 py-3 md:py-4">
        {/* Header con título y botón refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 space-y-2 md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gov-black">Dashboard</h1>
            <p className="text-base md:text-lg text-gov-gray-a">Monitoreo en tiempo real del Río Claro</p>
            <p className="text-sm text-gov-gray-b">
              Última actualización: {mounted && currentTime ? formatDateTime(currentTime.toISOString()) : "Cargando..."}
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white w-full md:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        <div className="space-y-3 md:space-y-4">
          {/* Stats Cards - Responsivo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gov-gray-a">Estaciones</CardTitle>
                <MapPin className="h-4 w-4 text-gov-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-gov-black">{stats.total_stations}</div>
                <p className="text-xs text-gov-gray-b">{stats.active_stations} activas</p>
              </CardContent>
            </Card>

            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gov-gray-a">Nivel Promedio</CardTitle>
                <Droplets className="h-4 w-4 text-gov-green" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-gov-green">{formatWaterLevel(stats.average_level)}</div>
                <p className="text-xs text-gov-gray-b">En rango normal</p>
              </CardContent>
            </Card>

            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gov-gray-a">Alertas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-gov-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold text-gov-secondary">{stats.critical_stations}</div>
                <p className="text-xs text-gov-gray-b">{stats.critical_stations} crítica</p>
              </CardContent>
            </Card>

            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-gov-gray-a">Sistema</CardTitle>
                <Activity className="h-4 w-4 text-gov-green" />
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-gov-green">OK</div>
                <p className="text-xs text-gov-gray-b">Operativo</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico principal */}
          <Card className="bg-gov-white border-gov-accent">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gov-black">
                <TrendingUp className="h-5 w-5 text-gov-primary" />
                <span className="text-base md:text-lg">Nivel del Agua - Últimas 24 Horas</span>
              </CardTitle>
              <CardDescription className="text-gov-gray-a">
                Tendencia del nivel del agua en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NormalizedChart 
                rawData={latestMeasurements}
                sourceType={DataSourceType.MEASUREMENT}
                height={300}
              />
            </CardContent>
          </Card>

          {/* Estado de estaciones */}
          <Card className="bg-gov-white border-gov-accent">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gov-black">
                <MapPin className="h-5 w-5 text-gov-primary" />
                <span>Estado de Estaciones</span>
              </CardTitle>
              <CardDescription className="text-gov-gray-a">
                Resumen del estado actual de todas las estaciones de monitoreo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stations.map((station) => {
                  const isCritical = station.current_level > station.threshold;
                  const isActive = station.status === "active";

                  return (
                    <div
                      key={station.id}
                      className="p-3 rounded-lg border bg-gov-white"
                      style={{
                        borderColor: isCritical ? "var(--gov-secondary)" : "var(--gov-accent)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm md:text-base text-gov-black">{station.name}</h3>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: isActive ? "var(--gov-green)" : "var(--gov-orange)",
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gov-gray-b">Nivel actual:</span>
                          <span
                            className="font-bold"
                            style={{ color: isCritical ? "var(--gov-secondary)" : "var(--gov-green)" }}
                          >
                            {formatWaterLevel(station.current_level)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-gov-gray-b">Umbral:</span>
                          <span className="text-gov-orange">{formatWaterLevel(station.threshold)}</span>
                        </div>

                        <div className="text-xs text-gov-gray-b">
                          {formatDateTime(station.last_measurement)}
                        </div>

                        {isCritical && (
                          <div className="text-xs p-2 rounded text-center bg-gov-secondary text-white">
                            ¡Nivel Crítico!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}