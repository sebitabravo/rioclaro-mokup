import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import { Badge } from "@shared/components/ui/badge";
import { MapPin, Wifi, WifiOff } from "lucide-react";
import { useAlertStore } from '../stores/useAlertStore';

export const StationSelector: React.FC = () => {
  const {
    selectedStationId,
    stations,
    isLoadingStations,
    selectStation
  } = useAlertStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <Wifi className="h-3 w-3" />
    ) : (
      <WifiOff className="h-3 w-3" />
    );
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'maintenance': return 'Mantenimiento';
      case 'inactive': return 'Inactiva';
      default: return 'Desconocido';
    }
  };

  if (isLoadingStations) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Cargando estaciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Select
        value={selectedStationId?.toString() || ""}
        onValueChange={(value) => selectStation(parseInt(value))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona una estación" />
        </SelectTrigger>
        <SelectContent>
          {stations.map((station) => (
            <SelectItem key={station.id} value={station.id.toString()}>
              <div className="flex items-center space-x-3 w-full">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium">{station.name}</div>
                  <div className="text-xs text-gray-500">{station.code}</div>
                </div>
                <Badge className={`text-xs ${getStatusColor(station.status)}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(station.status)}
                    <span>{getStatusText(station.status)}</span>
                  </div>
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {stations.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No hay estaciones disponibles</p>
        </div>
      )}

      {stations.length > 0 && (
        <div className="text-sm text-gray-600">
          <strong>{stations.length}</strong> estación{stations.length !== 1 ? 'es' : ''} disponible{stations.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};