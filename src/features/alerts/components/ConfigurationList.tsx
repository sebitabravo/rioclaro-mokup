import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import {
  Settings,
  Edit,
  Trash2,
  AlertTriangle,
  AlertCircle,
  MoreVertical,
  Thermometer,
  Droplets,
  Gauge
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@shared/components/ui/dropdown-menu";
import { useAlertStore } from '../stores/useAlertStore';
import { AlertConfiguration, AlertThreshold } from '@domain/entities/Alert';

export const ConfigurationList: React.FC = () => {
  const {
    selectedStationId,
    configurations,
    isLoading,
    openForm,
    openDeleteDialog
  } = useAlertStore();

  const stationConfigurations = configurations.filter(c => c.station_id === selectedStationId);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'critical': return <AlertCircle className="h-3 w-3" />;
      case 'emergency': return <AlertTriangle className="h-3 w-3" />;
      default: return <Settings className="h-3 w-3" />;
    }
  };

  const getSensorIcon = (sensorType: string) => {
    switch (sensorType.toLowerCase()) {
      case 'temperature':
      case 'temperatura':
        return <Thermometer className="h-4 w-4" />;
      case 'water_level':
      case 'nivel_agua':
        return <Droplets className="h-4 w-4" />;
      case 'pressure':
      case 'presion':
        return <Gauge className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const formatThresholdValue = (threshold: AlertThreshold) => {
    const parts = [];

    if (threshold.min_value !== undefined && threshold.max_value !== undefined) {
      parts.push(`${threshold.min_value} - ${threshold.max_value}`);
    } else if (threshold.min_value !== undefined) {
      parts.push(`≥ ${threshold.min_value}`);
    } else if (threshold.max_value !== undefined) {
      parts.push(`≤ ${threshold.max_value}`);
    }

    if (threshold.tolerance !== undefined) {
      parts.push(`±${threshold.tolerance}`);
    }

    return parts.join(' ');
  };

  const handleEdit = (configuration: AlertConfiguration) => {
    openForm(configuration);
  };

  const handleDelete = (configuration: AlertConfiguration) => {
    openDeleteDialog(configuration);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (stationConfigurations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin Configuraciones
          </h3>
          <p className="text-gray-500 mb-4">
            Esta estación no tiene configuraciones de alerta definidas
          </p>
          <Button
            onClick={() => openForm()}
            className="inline-flex items-center space-x-2"
          >
            <Settings className="h-4 w-4" />
            <span>Crear Primera Configuración</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {stationConfigurations.map((configuration) => (
        <Card key={configuration.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getSensorIcon(configuration.sensor_type)}
                <div>
                  <CardTitle className="text-lg">{configuration.sensor_type}</CardTitle>
                  <CardDescription>
                    Unidad: {configuration.sensor_unit}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={configuration.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {configuration.is_active ? 'Activa' : 'Inactiva'}
                </Badge>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleEdit(configuration)}
                      className="cursor-pointer"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(configuration)}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Umbrales Configurados ({configuration.thresholds.length})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {configuration.thresholds.map((threshold, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getLevelColor(threshold.level)}`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {getLevelIcon(threshold.level)}
                        <span className="text-sm font-medium capitalize">
                          {threshold.level}
                        </span>
                        {!threshold.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            Inactivo
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs space-y-1">
                        <div>
                          <strong>Rango:</strong> {formatThresholdValue(threshold)}
                        </div>
                        {threshold.persistence_time && (
                          <div>
                            <strong>Persistencia:</strong> {threshold.persistence_time}min
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>
                  Creado: {new Date(configuration.created_at).toLocaleDateString()}
                </span>
                <span>
                  Actualizado: {new Date(configuration.updated_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};