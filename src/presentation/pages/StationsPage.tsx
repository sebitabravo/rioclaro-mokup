import { useEffect } from 'react';
import { Navbar } from '@presentation/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@presentation/components/ui/card';
import { MapPin } from 'lucide-react';
import { useStationStore } from '@presentation/stores/StationStore';
import { LoadingState } from '@presentation/components/ui/status-components';
import { formatDateTime, formatWaterLevel } from '@shared/utils/formatters';

export function StationsPage() {
  const { stations, loading, fetchStations } = useStationStore();

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gov-neutral">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando estaciones...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gov-black">Estaciones de Monitoreo</h1>
          <p className="text-lg text-gov-gray-a">Estado y ubicación de las estaciones del Río Claro</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => {
            const isCritical = station.current_level > station.threshold;
            const isActive = station.status === "active";

            return (
              <Card key={station.id} className="bg-gov-white border-gov-accent">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-gov-primary" />
                      <CardTitle className="text-lg text-gov-black">{station.name}</CardTitle>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: isActive ? "var(--gov-green)" : "var(--gov-orange)",
                      }}
                    />
                  </div>
                  <CardDescription>{station.location}</CardDescription>
                  <div className="text-xs font-mono text-gov-gray-b">{station.code}</div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gov-gray-b">Nivel actual:</span>
                      <span
                        className="font-bold text-lg"
                        style={{ color: isCritical ? "var(--gov-secondary)" : "var(--gov-green)" }}
                      >
                        {formatWaterLevel(station.current_level)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gov-gray-b">Umbral crítico:</span>
                      <span className="font-medium text-gov-orange">
                        {formatWaterLevel(station.threshold)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gov-gray-b">Estado:</span>
                      <span className={`text-sm font-medium ${
                        station.status === 'active' ? 'text-gov-green' : 
                        station.status === 'maintenance' ? 'text-gov-orange' : 'text-gov-gray-a'
                      }`}>
                        {station.status === 'active' ? 'Activa' : 
                         station.status === 'maintenance' ? 'Mantenimiento' : 'Inactiva'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-gov-accent">
                      <span className="text-xs text-gov-gray-b">
                        Última medición: {formatDateTime(station.last_measurement)}
                      </span>
                    </div>

                    {isCritical && (
                      <div className="p-2 rounded bg-gov-secondary text-white text-center text-sm font-medium">
                        ¡Nivel Crítico Superado!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}