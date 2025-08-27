import { useEffect, useState } from "react";
import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { StationsMap } from "@presentation/components/maps/StationsMap";
import { useStationStore } from "@presentation/stores/StationStore";
import { useMeasurementStore } from "@presentation/stores/MeasurementStore";
import { Map, RefreshCw, AlertTriangle, Eye, Activity } from "lucide-react";
import type { Station } from "@domain/entities/Station";

export function MapPage() {
  const { stations, loading, fetchStations } = useStationStore();
  const { measurements, fetchLatestMeasurements } = useMeasurementStore();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchStations();
    fetchLatestMeasurements();
  }, [fetchStations, fetchLatestMeasurements]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchStations();
      fetchLatestMeasurements();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchStations, fetchLatestMeasurements]);

  const handleStationClick = (station: Station) => {
    setSelectedStation(station);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchStations(), fetchLatestMeasurements()]);
  };

  const getStationsSummary = () => {
    const active = stations.filter(s => s.status === 'active').length;
    const critical = stations.filter(s => s.current_level > s.threshold).length;
    const warning = stations.filter(s => 
      s.current_level > s.threshold * 0.85 && s.current_level <= s.threshold
    ).length;
    const maintenance = stations.filter(s => s.status === 'maintenance').length;

    return { active, critical, warning, maintenance };
  };

  const summary = getStationsSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gov-neutral">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Activity className="h-8 w-8 mx-auto text-gov-primary mb-4 animate-spin" />
            <p className="text-gov-gray-a">Cargando mapa de estaciones...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gov-black">
                Mapa de Estaciones
              </h1>
              <p className="text-lg text-gov-gray-a">
                Visualización geográfica de sensores con alertas en tiempo real
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefreshMap"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-gov-primary focus:ring-gov-primary border-gov-accent rounded"
                />
                <label htmlFor="autoRefreshMap" className="text-sm text-gov-gray-a">
                  Auto-actualizar (30s)
                </label>
              </div>
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2 text-gov-black">
                      <Map className="h-5 w-5 text-gov-primary" />
                      <span>Río Claro - Pucón</span>
                    </CardTitle>
                    <CardDescription>
                      Sensores cambian de color según estado: 🟢 Normal, 🟠 Advertencia, 🔴 Crítico, ⚪ Mantenimiento
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gov-gray-a">Total estaciones</div>
                    <div className="text-2xl font-bold text-gov-primary">{stations.length}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StationsMap
                  stations={stations}
                  height="500px"
                  onStationClick={handleStationClick}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary */}
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader>
                <CardTitle className="text-gov-black">Resumen del Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gov-green"></div>
                    <span className="text-sm text-gov-gray-a">Activas</span>
                  </div>
                  <span className="font-bold text-gov-green">{summary.active}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gov-secondary"></div>
                    <span className="text-sm text-gov-gray-a">Críticas</span>
                  </div>
                  <span className="font-bold text-gov-secondary">{summary.critical}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gov-orange"></div>
                    <span className="text-sm text-gov-gray-a">Advertencia</span>
                  </div>
                  <span className="font-bold text-gov-orange">{summary.warning}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gov-gray-a"></div>
                    <span className="text-sm text-gov-gray-a">Mantenimiento</span>
                  </div>
                  <span className="font-bold text-gov-gray-a">{summary.maintenance}</span>
                </div>

                {summary.critical > 0 && (
                  <div className="mt-4 p-3 bg-gov-secondary/10 border border-gov-secondary/30 rounded-lg">
                    <div className="flex items-center space-x-2 text-gov-secondary mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">¡Alerta Crítica!</span>
                    </div>
                    <p className="text-xs text-gov-secondary">
                      {summary.critical} estación{summary.critical > 1 ? 'es' : ''} 
                      {summary.critical > 1 ? ' superan' : ' supera'} el umbral crítico
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Station Details */}
            {selectedStation && (
              <Card className="bg-gov-white border-gov-accent">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gov-black">
                    <Eye className="h-4 w-4 text-gov-primary" />
                    <span>Estación Seleccionada</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gov-black">{selectedStation.name}</h4>
                    <p className="text-sm text-gov-gray-a">{selectedStation.location}</p>
                    <p className="text-xs font-mono text-gov-gray-b">{selectedStation.code}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gov-gray-a">Nivel Actual:</span>
                      <span className={`font-bold ${
                        selectedStation.current_level > selectedStation.threshold 
                          ? 'text-gov-secondary' 
                          : 'text-gov-green'
                      }`}>
                        {selectedStation.current_level.toFixed(2)}m
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gov-gray-a">Umbral:</span>
                      <span className="font-medium text-gov-orange">
                        {selectedStation.threshold.toFixed(2)}m
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gov-gray-a">Estado:</span>
                      <span className={`text-sm font-medium ${
                        selectedStation.status === 'active' ? 'text-gov-green' : 
                        selectedStation.status === 'maintenance' ? 'text-gov-orange' : 'text-gov-gray-a'
                      }`}>
                        {selectedStation.status === 'active' ? 'Activa' : 
                         selectedStation.status === 'maintenance' ? 'Mantenimiento' : 'Inactiva'}
                      </span>
                    </div>
                  </div>

                  {selectedStation.current_level > selectedStation.threshold && (
                    <div className="mt-3 p-2 bg-gov-secondary/10 border border-gov-secondary/30 rounded text-center">
                      <div className="flex items-center justify-center space-x-1 text-gov-secondary">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium text-xs">NIVEL CRÍTICO</span>
                      </div>
                      <p className="text-xs text-gov-secondary mt-1">
                        Excede por {(selectedStation.current_level - selectedStation.threshold).toFixed(2)}m
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => setSelectedStation(null)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 bg-transparent border-gov-gray-a text-gov-gray-a hover:bg-gov-gray-a hover:text-white"
                  >
                    Cerrar Detalles
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader>
                <CardTitle className="text-gov-black text-sm">Instrucciones</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gov-gray-a space-y-2">
                <p>• Haz clic en un sensor para ver detalles</p>
                <p>• Los colores indican el estado en tiempo real</p>
                <p>• Los datos se actualizan automáticamente</p>
                <p>• Usa los botones del mapa para navegar</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}