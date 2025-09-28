import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Activity,
  Clock
} from 'lucide-react';
import { useAlertStore } from '../stores/useAlertStore';
import { Container } from '@infrastructure/di/Container';
import { Measurement } from '@domain/entities/Measurement';

interface SensorReading {
  timestamp: string;
  value: number;
  quality?: string;
}

export const SensorPreview: React.FC = () => {
  const {
    selectedStationId,
    configurations
  } = useAlertStore();

  const [selectedSensorType, setSelectedSensorType] = useState<string>('');
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const stationConfigurations = configurations.filter(c => c.station_id === selectedStationId);
  const selectedConfiguration = stationConfigurations.find(c => c.sensor_type === selectedSensorType);

  // Auto-select first sensor type if available
  useEffect(() => {
    if (stationConfigurations.length > 0 && !selectedSensorType) {
      setSelectedSensorType(stationConfigurations[0].sensor_type);
    }
  }, [stationConfigurations, selectedSensorType]);

  // Fetch sensor data
  const fetchSensorData = useCallback(async () => {
    if (!selectedStationId || !selectedSensorType) return;

    setIsLoading(true);
    try {
      const measurementUseCase = Container.measurementRepository;

      // Get latest measurements for the station
      const measurements = await measurementUseCase.findLatest(selectedStationId);

      // Filter by sensor type and convert to chart data
      const sensorMeasurements = measurements
        .filter((m: Measurement) => m.variable_type === selectedSensorType)
        .slice(0, 24) // Last 24 readings
        .map((m: Measurement) => ({
          timestamp: new Date(m.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          value: m.value,
          quality: m.quality
        }))
        .reverse(); // Show oldest to newest

      setSensorData(sensorMeasurements);

      // Set current value to the latest reading
      if (sensorMeasurements.length > 0) {
        setCurrentValue(sensorMeasurements[sensorMeasurements.length - 1].value);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStationId, selectedSensorType]);

  useEffect(() => {
    fetchSensorData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSensorData, 30000);
    return () => clearInterval(interval);
  }, [selectedStationId, selectedSensorType, fetchSensorData]);

  const getCurrentStatus = () => {
    if (!selectedConfiguration || currentValue === null) {
      return { level: 'unknown', message: 'Sin datos' };
    }

    // Check thresholds in order: emergency -> critical -> warning
    const activeThresholds = selectedConfiguration.thresholds
      .filter(t => t.is_active)
      .sort((a, b) => {
        const order = { emergency: 3, critical: 2, warning: 1 };
        return order[b.level] - order[a.level];
      });

    for (const threshold of activeThresholds) {
      const { min_value, max_value, tolerance = 0 } = threshold;

      let isTriggered = false;

      if (min_value !== undefined && max_value !== undefined) {
        // Range threshold
        isTriggered = currentValue < (min_value - tolerance) || currentValue > (max_value + tolerance);
      } else if (min_value !== undefined) {
        // Minimum threshold
        isTriggered = currentValue < (min_value - tolerance);
      } else if (max_value !== undefined) {
        // Maximum threshold
        isTriggered = currentValue > (max_value + tolerance);
      }

      if (isTriggered) {
        return {
          level: threshold.level,
          message: `Umbral ${threshold.level} activado`
        };
      }
    }

    return { level: 'normal', message: 'Valores normales' };
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (level: string) => {
    switch (level) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendIcon = () => {
    if (sensorData.length < 2) return <Minus className="h-4 w-4 text-gray-400" />;

    const latest = sensorData[sensorData.length - 1].value;
    const previous = sensorData[sensorData.length - 2].value;

    if (latest > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (latest < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const status = getCurrentStatus();

  return (
    <div className="space-y-6">
      {/* Sensor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Vista Previa en Tiempo Real</span>
          </CardTitle>
          <CardDescription>
            Monitorea los valores actuales vs umbrales configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedSensorType} onValueChange={setSelectedSensorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un sensor" />
                </SelectTrigger>
                <SelectContent>
                  {stationConfigurations.map((config) => (
                    <SelectItem key={config.sensor_type} value={config.sensor_type}>
                      {config.sensor_type} ({config.sensor_unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchSensorData}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedSensorType && (
        <>
          {/* Current Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">
                    {currentValue !== null ? currentValue.toFixed(2) : '--'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedConfiguration?.sensor_unit}
                  </div>
                  {getTrendIcon()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${getStatusColor(status.level)}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(status.level)}
                    <span className="capitalize">{status.level === 'normal' ? 'Normal' : status.level}</span>
                  </div>
                </Badge>
                <div className="text-xs text-gray-500 mt-1">
                  {status.message}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Última Actualización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    {lastUpdated ? lastUpdated.toLocaleTimeString('es-ES') : '--:--'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {sensorData.length} lecturas
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Historial Reciente (Últimas 24 lecturas)</CardTitle>
              <CardDescription>
                Líneas rojas indican umbrales configurados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Cargando datos...</span>
                </div>
              ) : sensorData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      label={{
                        value: selectedConfiguration?.sensor_unit || '',
                        angle: -90,
                        position: 'insideLeft'
                      }}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `${value.toFixed(2)} ${selectedConfiguration?.sensor_unit}`,
                        'Valor'
                      ]}
                      labelFormatter={(label) => `Hora: ${label}`}
                    />
                    <Legend />

                    {/* Main data line */}
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Sensor"
                    />

                    {/* Threshold lines */}
                    {selectedConfiguration?.thresholds
                      .filter(t => t.is_active)
                      .map((threshold, index) => (
                        <React.Fragment key={index}>
                          {threshold.min_value !== undefined && (
                            <ReferenceLine
                              y={threshold.min_value}
                              stroke={threshold.level === 'warning' ? '#f59e0b' :
                                     threshold.level === 'critical' ? '#f97316' : '#dc2626'}
                              strokeDasharray="5 5"
                              label={{ value: `Min ${threshold.level}`, position: 'insideTopLeft' }}
                            />
                          )}
                          {threshold.max_value !== undefined && (
                            <ReferenceLine
                              y={threshold.max_value}
                              stroke={threshold.level === 'warning' ? '#f59e0b' :
                                     threshold.level === 'critical' ? '#f97316' : '#dc2626'}
                              strokeDasharray="5 5"
                              label={{ value: `Max ${threshold.level}`, position: 'insideBottomLeft' }}
                            />
                          )}
                        </React.Fragment>
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin Datos Disponibles
                  </h3>
                  <p className="text-gray-500">
                    No hay mediciones recientes para este sensor
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Threshold Summary */}
          {selectedConfiguration && (
            <Card>
              <CardHeader>
                <CardTitle>Umbrales Configurados</CardTitle>
                <CardDescription>
                  Resumen de umbrales activos para {selectedConfiguration.sensor_type}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedConfiguration.thresholds
                    .filter(t => t.is_active)
                    .map((threshold, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${getStatusColor(threshold.level).replace('bg-', 'border-').replace('text-', 'bg-').replace('border-', 'text-').replace('text-', 'border-')}`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(threshold.level)}
                          <span className="font-medium capitalize">{threshold.level}</span>
                        </div>
                        <div className="text-sm space-y-1">
                          {threshold.min_value !== undefined && (
                            <div>Mínimo: {threshold.min_value} {selectedConfiguration.sensor_unit}</div>
                          )}
                          {threshold.max_value !== undefined && (
                            <div>Máximo: {threshold.max_value} {selectedConfiguration.sensor_unit}</div>
                          )}
                          {threshold.tolerance !== undefined && (
                            <div>Tolerancia: ±{threshold.tolerance} {selectedConfiguration.sensor_unit}</div>
                          )}
                          {threshold.persistence_time !== undefined && (
                            <div>Persistencia: {threshold.persistence_time}min</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {stationConfigurations.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin Configuraciones
            </h3>
            <p className="text-gray-500">
              Esta estación no tiene configuraciones de alerta para mostrar preview
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};