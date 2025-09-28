import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Alert, AlertDescription } from "@shared/components/ui/alert";
import {
  Settings,
  MapPin,
  Plus,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { useAlertStore } from '../stores/useAlertStore';
import { StationSelector } from './StationSelector';
import { ConfigurationList } from './ConfigurationList';
import { ThresholdForm } from './ThresholdForm';
import { SensorPreview } from './SensorPreview';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

export const AlertConfigurationDashboard: React.FC = () => {
  const {
    selectedStationId,
    configurations,
    stations,
    isLoadingStations,
    error,
    isFormOpen,
    isDeleteDialogOpen,
    configurationToDelete,
    openForm,
  } = useAlertStore();

  const [activeView, setActiveView] = useState<'configurations' | 'preview'>('configurations');

  const selectedStation = stations.find(s => s.id === selectedStationId);
  const stationConfigurations = configurations.filter(c => c.station_id === selectedStationId);


  const getActiveThresholds = () => {
    return stationConfigurations.reduce((total, config) => {
      return total + config.thresholds.filter(t => t.is_active).length;
    }, 0);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Configuración de Alertas
          </h1>
          <p className="text-gray-600 mt-1">
            Configura umbrales y niveles de alerta para sensores por estación
          </p>
        </div>

        {selectedStationId && (
          <Button
            onClick={() => openForm()}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Configuración</span>
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Station Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Seleccionar Estación</span>
          </CardTitle>
          <CardDescription>
            Selecciona una estación para configurar sus alertas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StationSelector />
        </CardContent>
      </Card>

      {selectedStationId && selectedStation && (
        <>
          {/* Station Info and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Estación Seleccionada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold">{selectedStation.name}</div>
                <div className="text-sm text-gray-500">{selectedStation.code}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Configuraciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stationConfigurations.length}
                </div>
                <div className="text-sm text-gray-500">Sensores configurados</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Umbrales Activos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {getActiveThresholds()}
                </div>
                <div className="text-sm text-gray-500">En monitoreo</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant={selectedStation.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {selectedStation.status === 'active' ? 'Activa' :
                   selectedStation.status === 'maintenance' ? 'Mantenimiento' : 'Inactiva'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2">
            <Button
              variant={activeView === 'configurations' ? 'default' : 'outline'}
              onClick={() => setActiveView('configurations')}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configuraciones</span>
            </Button>
            <Button
              variant={activeView === 'preview' ? 'default' : 'outline'}
              onClick={() => setActiveView('preview')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Vista Previa</span>
            </Button>
          </div>

          {/* Main Content */}
          {activeView === 'configurations' ? (
            <ConfigurationList />
          ) : (
            <SensorPreview />
          )}
        </>
      )}

      {!selectedStationId && !isLoadingStations && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Selecciona una Estación
            </h3>
            <p className="text-gray-500">
              Para comenzar a configurar alertas, selecciona una estación de monitoreo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Forms and Dialogs */}
      {isFormOpen && <ThresholdForm />}
      {isDeleteDialogOpen && configurationToDelete && (
        <DeleteConfirmationDialog configuration={configurationToDelete} />
      )}
    </div>
  );
};