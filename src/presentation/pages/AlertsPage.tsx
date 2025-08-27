import { useEffect, useState } from "react";
import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { Input } from "@presentation/components/ui/input";
import { AlertTriangle, Settings, Activity, Edit, Save, X, CheckCircle, AlertCircle } from "lucide-react";
import { useStationStore } from "@presentation/stores/StationStore";
import type { Station } from "@domain/entities/Station";

// Mock data for active alerts
const mockActiveAlerts = [
  {
    id: 1,
    station_id: 3,
    station_name: "Río Claro Sur",
    type: "critical" as const,
    message: "Nivel del agua superó el umbral crítico",
    level: 3.2,
    threshold: 3.0,
    status: "active" as const,
    created_at: "2025-01-13T09:45:00Z"
  },
  {
    id: 2,
    station_id: 1,
    station_name: "Río Claro Norte",
    type: "warning" as const,
    message: "Nivel del agua se aproxima al umbral",
    level: 2.8,
    threshold: 3.0,
    status: "active" as const,
    created_at: "2025-01-13T11:20:00Z"
  }
];

// Module configuration data
const moduleConfiguration = [
  {
    id: 'water_level',
    name: 'Monitoreo de Nivel de Agua',
    description: 'Módulo principal del sistema (obligatorio)',
    active: true,
    required: true
  },
  {
    id: 'turbidity',
    name: 'Monitoreo de Turbidez',
    description: 'Medición de calidad del agua',
    active: false,
    required: false
  },
  {
    id: 'temperature',
    name: 'Monitoreo de Temperatura',
    description: 'Temperatura del agua y ambiente',
    active: false,
    required: false
  },
  {
    id: 'ph',
    name: 'Medición de pH',
    description: 'Acidez del agua',
    active: false,
    required: false
  },
  {
    id: 'conductivity',
    name: 'Conductividad Eléctrica',
    description: 'Conductividad del agua',
    active: false,
    required: false
  }
];

export function AlertsPage() {
  const { stations, loading, fetchStations, updateStation } = useStationStore();
  const [editingThresholds, setEditingThresholds] = useState<Record<number, string>>({});
  const [modules, setModules] = useState(moduleConfiguration);
  const [savingThreshold, setSavingThreshold] = useState<number | null>(null);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleEditThreshold = (stationId: number, currentThreshold: number) => {
    setEditingThresholds(prev => ({
      ...prev,
      [stationId]: currentThreshold.toString()
    }));
  };

  const handleSaveThreshold = async (stationId: number) => {
    const newThreshold = editingThresholds[stationId];
    if (newThreshold) {
      setSavingThreshold(stationId);
      try {
        await updateStation(stationId, { threshold: parseFloat(newThreshold) });
        setEditingThresholds(prev => {
          const updated = { ...prev };
          delete updated[stationId];
          return updated;
        });
        await fetchStations();
      } catch (error) {
        console.error('Error al actualizar umbral:', error);
      } finally {
        setSavingThreshold(null);
      }
    }
  };

  const handleCancelEdit = (stationId: number) => {
    setEditingThresholds(prev => {
      const updated = { ...prev };
      delete updated[stationId];
      return updated;
    });
  };

  const toggleModule = (moduleId: string) => {
    if (moduleId === 'water_level') return; // Cannot disable main module
    
    setModules(prev => prev.map(module => 
      module.id === moduleId 
        ? { ...module, active: !module.active }
        : module
    ));
  };

  const getAlertsByStation = (stationId: number) => {
    return mockActiveAlerts.filter(alert => alert.station_id === stationId);
  };

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gov-black">
            Alertas y Configuración
          </h1>
          <p className="text-lg text-gov-gray-a">
            Gestión de umbrales, alertas y configuración del sistema
          </p>
        </div>

        <div className="space-y-6">
          {/* Alertas Activas */}
          <Card className="bg-gov-white border-gov-accent">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gov-secondary">
                <AlertTriangle className="h-5 w-5" />
                <span>Alertas Activas ({mockActiveAlerts.length})</span>
              </CardTitle>
              <CardDescription>Estado actual de las alertas del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActiveAlerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-gov-green mb-4" />
                    <p className="text-gov-gray-a">No hay alertas activas</p>
                  </div>
                ) : (
                  mockActiveAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg text-white ${
                        alert.type === 'critical' ? 'bg-gov-secondary' : 'bg-gov-orange'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {alert.type === 'critical' ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <AlertCircle className="h-5 w-5" />
                          )}
                          <div>
                            <p className="font-medium">{alert.station_name}</p>
                            <p className="text-sm opacity-90">
                              {alert.message} ({alert.level}m {alert.type === 'critical' ? '>' : '≈'} {alert.threshold}m)
                            </p>
                            <p className="text-xs opacity-75 mt-1">
                              {new Date(alert.created_at).toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.type === 'critical' ? 'bg-white text-gov-secondary' : 'bg-white text-gov-orange'
                          }`}>
                            {alert.type === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Umbrales */}
          <Card className="bg-gov-white border-gov-accent">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gov-black">
                <Settings className="h-5 w-5 text-gov-primary" />
                <span>Configuración de Umbrales</span>
              </CardTitle>
              <CardDescription>Define los niveles críticos para cada estación</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 mx-auto text-gov-primary mb-4 animate-spin" />
                  <p className="text-gov-gray-a">Cargando estaciones...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stations.map((station) => {
                    const isEditing = editingThresholds[station.id] !== undefined;
                    const stationAlerts = getAlertsByStation(station.id);
                    
                    return (
                      <div
                        key={station.id}
                        className={`p-4 rounded-lg border ${
                          stationAlerts.some(a => a.type === 'critical') 
                            ? 'border-gov-secondary bg-gov-secondary/10'
                            : stationAlerts.some(a => a.type === 'warning')
                            ? 'border-gov-orange bg-orange-50'
                            : 'border-gov-accent bg-gov-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Settings className="h-5 w-5 text-gov-primary" />
                              <div>
                                <p className="font-medium text-gov-black">{station.name}</p>
                                <p className="text-sm text-gov-gray-a">{station.location}</p>
                                <p className="text-xs text-gov-gray-b">Código: {station.code}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm text-gov-gray-a">Nivel Actual</p>
                              <p className={`font-bold text-lg ${
                                station.current_level > station.threshold ? 'text-gov-secondary' : 'text-gov-green'
                              }`}>
                                {station.current_level}m
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <div className="text-center">
                                <p className="text-sm text-gov-gray-a">Umbral Crítico</p>
                                {isEditing ? (
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Input
                                      type="number"
                                      step="0.1"
                                      value={editingThresholds[station.id]}
                                      onChange={(e) => setEditingThresholds(prev => ({
                                        ...prev,
                                        [station.id]: e.target.value
                                      }))}
                                      className="w-20 h-8 text-sm"
                                    />
                                    <span className="text-sm text-gov-gray-a">m</span>
                                  </div>
                                ) : (
                                  <p className="font-bold text-lg text-gov-orange">
                                    {station.threshold}m
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex flex-col space-y-1">
                                {isEditing ? (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleSaveThreshold(station.id)}
                                      disabled={savingThreshold === station.id}
                                      className="bg-gov-green text-white hover:bg-gov-green/90 h-7 px-2"
                                    >
                                      {savingThreshold === station.id ? (
                                        <Activity className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Save className="h-3 w-3" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelEdit(station.id)}
                                      className="h-7 px-2 border-gov-gray-a text-gov-gray-a"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditThreshold(station.id, station.threshold)}
                                    className="bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white h-7 px-2"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Show alerts for this station */}
                        {stationAlerts.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gov-accent">
                            <p className="text-xs font-medium text-gov-gray-a mb-2">Alertas activas:</p>
                            <div className="flex flex-wrap gap-2">
                              {stationAlerts.map(alert => (
                                <div
                                  key={alert.id}
                                  className={`px-2 py-1 rounded text-xs font-medium text-white ${
                                    alert.type === 'critical' ? 'bg-gov-secondary' : 'bg-gov-orange'
                                  }`}
                                >
                                  {alert.type === 'critical' ? '🚨 CRÍTICO' : '⚠️ ADVERTENCIA'}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Módulos Variables */}
          <Card className="bg-gov-white border-gov-accent">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gov-black">
                <Activity className="h-5 w-5 text-gov-primary" />
                <span>Gestión de Módulos de Variables</span>
              </CardTitle>
              <CardDescription>Activar o desactivar módulos de monitoreo adicionales (RF4.1-RF4.4)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      module.active
                        ? module.required
                          ? 'bg-gov-primary/10 border-gov-primary/30'
                          : 'bg-gov-green/10 border-gov-green/30'
                        : 'bg-gov-white border-gov-accent'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        module.active ? 'bg-gov-green' : 'bg-gov-gray-a'
                      }`} />
                      <div>
                        <p className="font-medium text-gov-black">{module.name}</p>
                        <p className="text-sm text-gov-gray-b">{module.description}</p>
                        {module.required && (
                          <p className="text-xs text-gov-primary mt-1">* Módulo obligatorio</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`text-sm font-medium ${
                        module.active 
                          ? module.required ? 'text-gov-primary' : 'text-gov-green'
                          : 'text-gov-gray-a'
                      }`}>
                        {module.active ? 'Activo' : 'Inactivo'}
                      </div>
                      
                      {!module.required && (
                        <Button
                          variant={module.active ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleModule(module.id)}
                          className={`h-8 px-3 ${
                            module.active
                              ? 'border-gov-secondary text-gov-secondary hover:bg-gov-secondary hover:text-white'
                              : 'bg-gov-green text-white hover:bg-gov-green/90'
                          }`}
                        >
                          {module.active ? 'Desactivar' : 'Activar'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 p-4 rounded-lg bg-gov-neutral border border-gov-accent">
                  <h4 className="font-medium text-gov-black mb-2">ℹ️ Información sobre Módulos</h4>
                  <ul className="text-sm text-gov-gray-a space-y-1">
                    <li>• <strong>Nivel de Agua:</strong> Módulo principal y obligatorio del sistema</li>
                    <li>• <strong>Módulos Adicionales:</strong> Se activan cuando se conectan sensores correspondientes</li>
                    <li>• Solo los módulos activos aparecen en el dashboard y reportes</li>
                    <li>• Los cambios se reflejan inmediatamente en toda la aplicación</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}