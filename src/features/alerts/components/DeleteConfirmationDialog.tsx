import React from 'react';
import { Button } from "@shared/components/ui/button";
import { Badge } from "@shared/components/ui/badge";
import { Alert, AlertDescription } from "@shared/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import {
  AlertTriangle,
  AlertCircle,
  Trash2,
  Settings,
  Info
} from "lucide-react";
import { useAlertStore } from '../stores/useAlertStore';
import { AlertConfiguration } from '@domain/entities/Alert';

interface DeleteConfirmationDialogProps {
  configuration: AlertConfiguration;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  configuration
}) => {
  const {
    isDeleteDialogOpen,
    isDeleting,
    closeDeleteDialog,
    deleteConfiguration
  } = useAlertStore();

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

  const handleDelete = async () => {
    try {
      await deleteConfiguration(configuration.id);
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting configuration:', error);
    }
  };

  const activeThresholds = configuration.thresholds.filter(t => t.is_active);
  const totalThresholds = configuration.thresholds.length;

  return (
    <Dialog open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            <span>Eliminar Configuración</span>
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la configuración
            de alertas y todos sus umbrales asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Configuration Details */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estación:</span>
                <span className="text-sm">{configuration.station_name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sensor:</span>
                <span className="text-sm">{configuration.sensor_type}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Unidad:</span>
                <span className="text-sm">{configuration.sensor_unit}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Estado:</span>
                <Badge
                  variant={configuration.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {configuration.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Thresholds Summary */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Umbrales a eliminar ({totalThresholds})
            </h4>

            <div className="space-y-2">
              {configuration.thresholds.map((threshold, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-2 rounded border ${getLevelColor(threshold.level)}`}
                >
                  <div className="flex items-center space-x-2">
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

                  <div className="text-xs">
                    {threshold.min_value !== undefined && threshold.max_value !== undefined
                      ? `${threshold.min_value} - ${threshold.max_value}`
                      : threshold.min_value !== undefined
                      ? `≥ ${threshold.min_value}`
                      : threshold.max_value !== undefined
                      ? `≤ ${threshold.max_value}`
                      : 'Sin límites'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning for active configuration */}
          {configuration.is_active && activeThresholds.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Advertencia:</strong> Esta configuración está activa y tiene {activeThresholds.length}
                umbral{activeThresholds.length !== 1 ? 'es' : ''} en monitoreo.
                Al eliminarla, se detendrá la generación de alertas para este sensor.
              </AlertDescription>
            </Alert>
          )}

          {/* Impact notice */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Impacto:</strong> Las alertas históricas generadas por esta configuración
              se mantendrán, pero no se generarán nuevas alertas para este sensor hasta que
              se cree una nueva configuración.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={closeDeleteDialog}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center space-x-2"
          >
            {isDeleting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <Trash2 className="h-4 w-4" />
            <span>Eliminar Configuración</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};