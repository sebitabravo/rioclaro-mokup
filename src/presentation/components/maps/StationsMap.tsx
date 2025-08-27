import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '@domain/entities/Station';
import { formatWaterLevel, formatDateTime } from '@shared/utils/formatters';
import { AlertTriangle, AlertCircle } from 'lucide-react';

// Fix for default markers in React Leaflet
import { Icon } from 'leaflet';
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface StationsMapProps {
  stations: Station[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onStationClick?: (station: Station) => void;
}

interface MapUpdaterProps {
  center: [number, number];
  zoom: number;
  stations: Station[];
}

function MapUpdater({ center, zoom, stations }: MapUpdaterProps) {
  const map = useMap();
  
  const calculateBounds = () => {
    if (stations.length === 0) return;
    
    const latitudes = stations.map(s => s.latitude);
    const longitudes = stations.map(s => s.longitude);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    
    // Añadir padding para que los markers no estén en los bordes
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;
    
    const bounds = [
      [minLat - latPadding, minLng - lngPadding],
      [maxLat + latPadding, maxLng + lngPadding]
    ] as [[number, number], [number, number]];
    
    return bounds;
  };

  useEffect(() => {
    // Forzar invalidación del tamaño del mapa
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    if (stations.length > 0) {
      const bounds = calculateBounds();
      if (bounds) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    } else {
      map.setView(center, zoom);
    }
  }, [center, zoom, map, stations]);
  
  return null;
}

export function StationsMap({ 
  stations, 
  center = [-39.2851, -71.9374], // Pucón coordinates (fallback)
  zoom = 13,
  height = '400px',
  onStationClick
}: StationsMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  // Calcular el centro basado en las estaciones
  const calculateStationsCenter = (): [number, number] => {
    if (stations.length === 0) return center;
    
    const latitudes = stations.map(s => s.latitude);
    const longitudes = stations.map(s => s.longitude);
    
    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
    
    return [avgLat, avgLng];
  };

  // Auto-centrar en las estaciones cuando se cargan
  useEffect(() => {
    if (stations.length > 0) {
      const stationsCenter = calculateStationsCenter();
      setMapCenter(stationsCenter);
    }
  }, [stations]);

  // Forzar actualización del tamaño cuando la altura cambie
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger a resize event to force map to redraw
      window.dispatchEvent(new Event('resize'));
    }, 200);
    
    return () => clearTimeout(timer);
  }, [height]);

  const getStationStatus = (station: Station) => {
    if (station.status !== 'active') {
      return 'maintenance';
    }
    if (station.current_level > station.threshold) {
      return 'critical';
    }
    if (station.current_level > station.threshold * 0.8) {
      return 'warning';
    }
    return 'normal';
  };

  const getStationColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#dc2626'; // red
      case 'warning':
        return '#ea580c'; // orange
      case 'maintenance':
        return '#64748b'; // gray
      case 'normal':
      default:
        return '#16a34a'; // green
    }
  };

  const getStationIcon = (station: Station) => {
    const status = getStationStatus(station);
    const color = getStationColor(status);
    
    let iconSymbol = '●';
    switch (status) {
      case 'critical':
        iconSymbol = '🚨';
        break;
      case 'warning':
        iconSymbol = '⚠️';
        break;
      case 'maintenance':
        iconSymbol = '🔧';
        break;
      case 'normal':
        iconSymbol = '✅';
        break;
    }

    return divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s ease;
        " 
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'"
        >
          <span style="filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));">
            ${iconSymbol}
          </span>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const handleMarkerClick = (station: Station) => {
    if (onStationClick) {
      onStationClick(station);
    }
  };

  const centerMapOnStation = (station: Station) => {
    setMapCenter([station.latitude, station.longitude]);
    setMapZoom(15);
  };

  // Función para restablecer la vista por defecto
  const resetMapView = () => {
    if (stations.length > 0) {
      const stationsCenter = calculateStationsCenter();
      setMapCenter(stationsCenter);
      setMapZoom(12);
    } else {
      setMapCenter([-39.2851, -71.9374]);
      setMapZoom(13);
    }
  };

  return (
    <div className="relative">
      {/* Map Legend */}
      <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 border border-gov-accent">
        <h4 className="font-medium text-sm text-gov-black mb-2">Estado de Sensores</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gov-green"></div>
            <span className="text-gov-gray-a">Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gov-orange"></div>
            <span className="text-gov-gray-a">Advertencia</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gov-secondary"></div>
            <span className="text-gov-gray-a">Crítico</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gov-gray-a"></div>
            <span className="text-gov-gray-a">Mantenimiento</span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Movido a la parte inferior izquierda */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 border border-gov-accent">
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => {
              if (stations.length > 0) {
                const stationsCenter = calculateStationsCenter();
                setMapCenter(stationsCenter);
                setMapZoom(12); // Zoom más apropiado para ver todas las estaciones
              } else {
                setMapCenter([-39.2851, -71.9374]);
                setMapZoom(13);
              }
            }}
            className="px-2 py-1 text-xs bg-gov-primary text-white rounded hover:bg-gov-primary/90 transition-colors"
          >
            Ver Estaciones
          </button>
          {stations.filter(s => getStationStatus(s) === 'critical').length > 0 && (
            <button
              onClick={() => {
                const criticalStation = stations.find(s => getStationStatus(s) === 'critical');
                if (criticalStation) centerMapOnStation(criticalStation);
              }}
              className="px-2 py-1 text-xs bg-gov-secondary text-white rounded hover:bg-gov-secondary/90 transition-colors"
            >
              Ver Críticos
            </button>
          )}
        </div>
      </div>

      <MapContainer
        center={stations.length > 0 ? calculateStationsCenter() : center}
        zoom={stations.length > 0 ? 12 : zoom}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gov-accent"
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} stations={stations} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {stations.map((station) => {
          const status = getStationStatus(station);
          
          return (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={getStationIcon(station)}
              eventHandlers={{
                click: () => handleMarkerClick(station),
              }}
            >
              <Popup 
                className="custom-popup"
                eventHandlers={{
                  remove: () => resetMapView(),
                }}
              >
                <div className="p-0 min-w-[280px] bg-white rounded-lg overflow-hidden shadow-xl">
                  {/* Header con gradiente - más compacto */}
                  <div className={`px-3 py-2 text-white relative ${
                    status === 'critical' ? 'bg-gradient-to-r from-gov-secondary to-red-600' :
                    status === 'warning' ? 'bg-gradient-to-r from-gov-orange to-orange-600' :
                    status === 'maintenance' ? 'bg-gradient-to-r from-gov-gray-a to-gray-600' : 
                    'bg-gradient-to-r from-gov-primary to-blue-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{station.name}</h3>
                        <p className="text-xs opacity-90 font-mono leading-tight">{station.code}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30`}>
                        {status === 'critical' ? 'CRÍTICO' :
                         status === 'warning' ? 'ADVERTENCIA' :
                         status === 'maintenance' ? 'MANTENIMIENTO' : 'NORMAL'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Contenido principal - más compacto */}
                  <div className="p-3 space-y-2">
                    {/* Ubicación - más compacta */}
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gov-gray-a mt-1.5"></div>
                      <div className="flex-1">
                        <span className="text-xs text-gov-gray-a uppercase tracking-wide font-medium">Ubicación</span>
                        <p className="text-xs text-gov-black font-medium leading-tight">{station.location}</p>
                      </div>
                    </div>

                    {/* Métricas principales - más compactas */}
                    {station.status === 'maintenance' ? (
                      // Mostrar aviso especial para estaciones en mantenimiento
                      <div className="bg-gray-100 border border-gray-300 rounded-lg p-2 text-center">
                        <div className="text-sm text-gov-gray-a mb-1">🔧 En Mantenimiento</div>
                        <div className="text-xs text-gov-gray-b">
                          Último dato: {formatWaterLevel(station.current_level)}
                        </div>
                      </div>
                    ) : (
                      // Mostrar métricas normales para estaciones activas
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gov-gray-a uppercase tracking-wide font-medium mb-0.5">Nivel Actual</div>
                          <div className={`text-base font-bold leading-tight ${
                            station.current_level > station.threshold ? 'text-gov-secondary' : 'text-gov-green'
                          }`}>
                            {formatWaterLevel(station.current_level)}
                          </div>
                        </div>
                        
                        <div className="bg-orange-50 rounded-lg p-2 text-center">
                          <div className="text-xs text-gov-gray-a uppercase tracking-wide font-medium mb-0.5">Umbral</div>
                          <div className="text-base font-bold leading-tight text-gov-orange">
                            {formatWaterLevel(station.threshold)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Barra de progreso del nivel - solo para estaciones activas */}
                    {station.status === 'active' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gov-gray-a">Nivel de riesgo</span>
                          <span className="font-medium text-gov-black">
                            {((station.current_level / station.threshold) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              station.current_level > station.threshold ? 'bg-gov-secondary' :
                              station.current_level > station.threshold * 0.8 ? 'bg-gov-orange' : 'bg-gov-green'
                            }`}
                            style={{
                              width: `${Math.min((station.current_level / station.threshold) * 100, 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Última medición - más compacta */}
                    <div className={`rounded-lg p-2 ${
                      station.status === 'maintenance' ? 'bg-gray-100 border border-gray-300' : 'bg-blue-50'
                    }`}>
                      <div className="text-xs text-gov-gray-a uppercase tracking-wide font-medium mb-0.5">
                        {station.status === 'maintenance' ? 'Última medición (antes del mantenimiento)' : 'Última medición'}
                      </div>
                      <div className={`text-xs font-medium leading-tight ${
                        station.status === 'maintenance' ? 'text-gov-gray-a' : 'text-gov-black'
                      }`}>
                        {formatDateTime(station.last_measurement)}
                      </div>
                      {station.status === 'maintenance' && (
                        <div className="mt-1 text-xs text-gov-gray-b italic">
                          Datos no actualizados durante mantenimiento
                        </div>
                      )}
                    </div>

                    {/* Alertas - más compactas */}
                    {station.status === 'maintenance' ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-1.5">
                        <div className="flex items-center space-x-1.5 text-yellow-600">
                          <AlertCircle className="h-3 w-3" />
                          <span className="font-semibold text-xs">MANTENIMIENTO</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {status === 'critical' && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                            <div className="flex items-center space-x-1.5 text-gov-secondary">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="font-semibold text-xs">¡NIVEL CRÍTICO SUPERADO!</span>
                            </div>
                            <p className="text-xs text-gov-secondary mt-0.5 ml-4.5">
                              Excede umbral por {(station.current_level - station.threshold).toFixed(2)}m
                            </p>
                          </div>
                        )}

                        {status === 'warning' && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                            <div className="flex items-center space-x-1.5 text-gov-orange">
                              <AlertCircle className="h-3 w-3" />
                              <span className="font-semibold text-xs">NIVEL DE ADVERTENCIA</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Footer con botón - más compacto */}
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => handleMarkerClick(station)}
                      className="w-full px-3 py-1.5 bg-gov-primary text-white text-xs font-medium rounded-lg hover:bg-gov-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Ver Detalles Completos
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}