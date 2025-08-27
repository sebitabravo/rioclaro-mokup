import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '@domain/entities/Station';
import { formatWaterLevel, formatDateTime } from '@shared/utils/formatters';
import { AlertTriangle, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

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
}

function MapUpdater({ center, zoom }: MapUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function StationsMap({ 
  stations, 
  center = [-39.2851, -71.9374], // Pucón coordinates
  zoom = 13,
  height = '400px',
  onStationClick
}: StationsMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [mapZoom, setMapZoom] = useState(zoom);

  const getStationStatus = (station: Station) => {
    if (station.status !== 'active') {
      return 'maintenance';
    }
    if (station.current_level > station.threshold) {
      return 'critical';
    }
    if (station.current_level > station.threshold * 0.85) {
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

      {/* Quick Actions */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-2 border border-gov-accent">
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => {
              setMapCenter([-39.2851, -71.9374]);
              setMapZoom(13);
            }}
            className="px-2 py-1 text-xs bg-gov-primary text-white rounded hover:bg-gov-primary/90 transition-colors"
          >
            Ver Todo
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
        center={center}
        zoom={zoom}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gov-accent"
      >
        <MapUpdater center={mapCenter} zoom={mapZoom} />
        
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
              <Popup className="custom-popup">
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gov-black text-sm">{station.name}</h3>
                    <div className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      status === 'critical' ? 'bg-gov-secondary' :
                      status === 'warning' ? 'bg-gov-orange' :
                      status === 'maintenance' ? 'bg-gov-gray-a' : 'bg-gov-green'
                    }`}>
                      {status === 'critical' ? 'CRÍTICO' :
                       status === 'warning' ? 'ADVERTENCIA' :
                       status === 'maintenance' ? 'MANTENIMIENTO' : 'NORMAL'}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gov-gray-a">Código:</span>
                      <span className="font-mono text-gov-black">{station.code}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gov-gray-a">Ubicación:</span>
                      <span className="text-gov-black text-right max-w-[150px]">{station.location}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gov-gray-a">Nivel Actual:</span>
                      <span className={`font-bold ${
                        station.current_level > station.threshold ? 'text-gov-secondary' : 'text-gov-green'
                      }`}>
                        {formatWaterLevel(station.current_level)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gov-gray-a">Umbral:</span>
                      <span className="text-gov-orange font-medium">
                        {formatWaterLevel(station.threshold)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gov-gray-a">Última medición:</span>
                      <span className="text-gov-black text-right">
                        {formatDateTime(station.last_measurement)}
                      </span>
                    </div>

                    {status === 'critical' && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-center">
                        <div className="flex items-center justify-center space-x-1 text-gov-secondary">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium text-xs">¡NIVEL CRÍTICO SUPERADO!</span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                          Excede umbral por {(station.current_level - station.threshold).toFixed(2)}m
                        </p>
                      </div>
                    )}

                    {status === 'warning' && (
                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-center">
                        <div className="flex items-center justify-center space-x-1 text-gov-orange">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium text-xs">NIVEL DE ADVERTENCIA</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gov-accent">
                    <button
                      onClick={() => handleMarkerClick(station)}
                      className="w-full px-3 py-1 bg-gov-primary text-white text-xs rounded hover:bg-gov-primary/90 transition-colors"
                    >
                      Ver Detalles
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