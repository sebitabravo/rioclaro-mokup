import React, { useState, useEffect } from 'react';
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Card, CardContent, CardHeader } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Alert, AlertDescription } from "@shared/components/ui/alert";
import { Switch } from "@shared/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import {
  Settings,
  AlertTriangle,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Info
} from "lucide-react";
import { useAlertStore } from '../stores/useAlertStore';
import { AlertThreshold } from '@domain/entities/Alert';

interface ThresholdFormData {
  station_id: number;
  sensor_type: string;
  is_active: boolean;
  thresholds: Omit<AlertThreshold, 'id' | 'created_at' | 'updated_at'>[];
}

const SENSOR_TYPES = [
  { value: 'water_level', label: 'Nivel de Agua', unit: 'cm' },
  { value: 'temperature', label: 'Temperatura', unit: '°C' },
  { value: 'ph', label: 'pH', unit: 'pH' },
  { value: 'turbidity', label: 'Turbidez', unit: 'NTU' },
  { value: 'dissolved_oxygen', label: 'Oxígeno Disuelto', unit: 'mg/L' },
  { value: 'flow_rate', label: 'Caudal', unit: 'L/s' },
  { value: 'pressure', label: 'Presión', unit: 'bar' },
];

const THRESHOLD_LEVELS = [
  { value: 'warning', label: 'Advertencia', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  { value: 'critical', label: 'Crítico', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
  { value: 'emergency', label: 'Emergencia', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
];

export const ThresholdForm: React.FC = () => {
  const {
    selectedStationId,
    stations,
    isFormOpen,
    formConfiguration,
    isCreating,
    isUpdating,
    closeForm,
    createConfiguration,
    updateConfiguration
  } = useAlertStore();

  const [formData, setFormData] = useState<ThresholdFormData>({
    station_id: selectedStationId || 0,
    sensor_type: '',
    is_active: true,
    thresholds: []
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const isEditing = !!formConfiguration;

  useEffect(() => {
    if (formConfiguration) {
      setFormData({
        station_id: formConfiguration.station_id,
        sensor_type: formConfiguration.sensor_type,
        is_active: formConfiguration.is_active,
        thresholds: formConfiguration.thresholds.map(t => ({
          level: t.level,
          min_value: t.min_value,
          max_value: t.max_value,
          tolerance: t.tolerance,
          persistence_time: t.persistence_time,
          is_active: t.is_active
        }))
      });
    } else {
      setFormData({
        station_id: selectedStationId || 0,
        sensor_type: '',
        is_active: true,
        thresholds: []
      });
    }
    setValidationErrors({});
  }, [formConfiguration, selectedStationId]);

  const selectedStation = stations.find(s => s.id === formData.station_id);
  const selectedSensorType = SENSOR_TYPES.find(s => s.value === formData.sensor_type);

  const addThreshold = () => {
    const usedLevels = formData.thresholds.map(t => t.level);
    const availableLevel = THRESHOLD_LEVELS.find(level => !usedLevels.includes(level.value as 'warning' | 'critical' | 'emergency'));

    if (!availableLevel) {
      setValidationErrors({ thresholds: 'Ya se han configurado todos los niveles de umbral disponibles' });
      return;
    }

    setFormData(prev => ({
      ...prev,
      thresholds: [
        ...prev.thresholds,
        {
          level: availableLevel.value as 'warning' | 'critical' | 'emergency',
          min_value: undefined,
          max_value: undefined,
          tolerance: undefined,
          persistence_time: 5,
          is_active: true
        }
      ]
    }));
    setValidationErrors({});
  };

  const removeThreshold = (index: number) => {
    setFormData(prev => ({
      ...prev,
      thresholds: prev.thresholds.filter((_, i) => i !== index)
    }));
  };

  const updateThreshold = (index: number, field: keyof AlertThreshold, value: string | number | boolean | undefined) => {
    setFormData(prev => ({
      ...prev,
      thresholds: prev.thresholds.map((threshold, i) =>
        i === index ? { ...threshold, [field]: value } : threshold
      )
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.sensor_type) {
      errors.sensor_type = 'Tipo de sensor es requerido';
    }

    if (formData.thresholds.length === 0) {
      errors.thresholds = 'Al menos un umbral es requerido';
    }

    // Validar cada umbral
    formData.thresholds.forEach((threshold, index) => {
      if (threshold.min_value !== undefined && threshold.max_value !== undefined) {
        if (threshold.min_value >= threshold.max_value) {
          errors[`threshold_${index}`] = `Valor mínimo debe ser menor al máximo para ${threshold.level}`;
        }
      }

      if (threshold.min_value === undefined && threshold.max_value === undefined) {
        errors[`threshold_${index}`] = `Debe definir al menos un valor (mínimo o máximo) para ${threshold.level}`;
      }

      if (threshold.persistence_time !== undefined && threshold.persistence_time < 0) {
        errors[`threshold_${index}`] = `Tiempo de persistencia debe ser mayor o igual a 0 para ${threshold.level}`;
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && formConfiguration) {
        await updateConfiguration(formConfiguration.id, {
          is_active: formData.is_active,
          thresholds: formData.thresholds
        });
      } else {
        await createConfiguration({
          station_id: formData.station_id,
          sensor_type: formData.sensor_type,
          is_active: formData.is_active,
          thresholds: formData.thresholds
        });
      }
      closeForm();
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  };

  const getLevelInfo = (level: string) => {
    return THRESHOLD_LEVELS.find(l => l.value === level);
  };

  return (
    <Dialog open={isFormOpen} onOpenChange={closeForm}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>
              {isEditing ? 'Editar Configuración de Alerta' : 'Nueva Configuración de Alerta'}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica la configuración de umbrales existente'
              : 'Configura umbrales de alerta para un sensor específico'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Station and Sensor Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="station">Estación</Label>
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium">{selectedStation?.name}</div>
                <div className="text-sm text-gray-500">{selectedStation?.code}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sensor_type">Tipo de Sensor</Label>
              <Select
                value={formData.sensor_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sensor_type: value }))}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un sensor" />
                </SelectTrigger>
                <SelectContent>
                  {SENSOR_TYPES.map((sensor) => (
                    <SelectItem key={sensor.value} value={sensor.value}>
                      {sensor.label} ({sensor.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.sensor_type && (
                <p className="text-sm text-red-600">{validationErrors.sensor_type}</p>
              )}
            </div>
          </div>

          {/* Configuration Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Configuración activa</Label>
          </div>

          {/* Thresholds */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Umbrales de Alerta</h3>
                <p className="text-sm text-gray-600">
                  Define los valores que activarán las alertas
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addThreshold}
                disabled={formData.thresholds.length >= 3}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Umbral</span>
              </Button>
            </div>

            {validationErrors.thresholds && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{validationErrors.thresholds}</AlertDescription>
              </Alert>
            )}

            {formData.thresholds.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No hay umbrales configurados</p>
                  <p className="text-sm text-gray-400">Agrega al menos un umbral para continuar</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {formData.thresholds.map((threshold, index) => {
                const levelInfo = getLevelInfo(threshold.level);
                const Icon = levelInfo?.icon || Settings;

                return (
                  <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${levelInfo?.color}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {levelInfo?.label}
                          </Badge>
                          <Switch
                            checked={threshold.is_active}
                            onCheckedChange={(checked: boolean) => updateThreshold(index, 'is_active', checked)}
                          />
                          <span className="text-sm text-gray-600">Activo</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeThreshold(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Valor Mínimo ({selectedSensorType?.unit})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ej: 10.5"
                            value={threshold.min_value || ''}
                            onChange={(e) => updateThreshold(index, 'min_value',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Valor Máximo ({selectedSensorType?.unit})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ej: 50.0"
                            value={threshold.max_value || ''}
                            onChange={(e) => updateThreshold(index, 'max_value',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tolerancia ({selectedSensorType?.unit})</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Ej: 2.0"
                            value={threshold.tolerance || ''}
                            onChange={(e) => updateThreshold(index, 'tolerance',
                              e.target.value ? parseFloat(e.target.value) : undefined
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tiempo de Persistencia (minutos)</Label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ej: 5"
                            value={threshold.persistence_time || ''}
                            onChange={(e) => updateThreshold(index, 'persistence_time',
                              e.target.value ? parseInt(e.target.value) : undefined
                            )}
                          />
                        </div>
                      </div>

                      {validationErrors[`threshold_${index}`] && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{validationErrors[`threshold_${index}`]}</AlertDescription>
                        </Alert>
                      )}

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          La alerta se activará cuando el valor del sensor exceda los límites configurados
                          durante el tiempo de persistencia especificado.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="flex items-center space-x-2"
            >
              {(isCreating || isUpdating) && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <Save className="h-4 w-4" />
              <span>{isEditing ? 'Actualizar' : 'Crear'} Configuración</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};