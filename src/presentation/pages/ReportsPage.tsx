import { useState } from "react";
import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { Input } from "@presentation/components/ui/input";
import { ExportButton } from "@presentation/components/ui/ExportButton";
import { TrendingUp, AlertTriangle, BarChart3, Calendar, Waves, Droplets, Gauge } from "lucide-react";
import { NormalizedChart } from "@presentation/components/charts/NormalizedChart";
import { MetricChart, MetricType } from "@presentation/components/charts/MetricChart";
import { DataSourceType } from "@shared/services/DataNormalizationService";
import { ReportActivityService } from "@shared/services/ReportActivityService";

// Datos mock para el demo
const mockDailyData = [
  { timestamp: "2025-01-07T12:00:00Z", value: 2.1, date: "2025-01-07" },
  { timestamp: "2025-01-08T12:00:00Z", value: 2.3, date: "2025-01-08" },
  { timestamp: "2025-01-09T12:00:00Z", value: 2.8, date: "2025-01-09" },
  { timestamp: "2025-01-10T12:00:00Z", value: 2.6, date: "2025-01-10" },
  { timestamp: "2025-01-11T12:00:00Z", value: 2.4, date: "2025-01-11" },
  { timestamp: "2025-01-12T12:00:00Z", value: 2.2, date: "2025-01-12" },
  { timestamp: "2025-01-13T12:00:00Z", value: 2.5, date: "2025-01-13" },
];

// Datos detallados para análisis de métricas
const mockDetailedMetrics = [
  { timestamp: "2025-01-07T00:00:00Z", flujo: 12.5, nivel: 2.1, caudal: 850, velocidad: 1.2 },
  { timestamp: "2025-01-07T06:00:00Z", flujo: 11.8, nivel: 2.0, caudal: 820, velocidad: 1.1 },
  { timestamp: "2025-01-07T12:00:00Z", flujo: 13.2, nivel: 2.3, caudal: 890, velocidad: 1.3 },
  { timestamp: "2025-01-07T18:00:00Z", flujo: 12.1, nivel: 2.1, caudal: 835, velocidad: 1.2 },
  { timestamp: "2025-01-08T00:00:00Z", flujo: 13.8, nivel: 2.4, caudal: 920, velocidad: 1.4 },
  { timestamp: "2025-01-08T06:00:00Z", flujo: 12.9, nivel: 2.2, caudal: 875, velocidad: 1.25 },
  { timestamp: "2025-01-08T12:00:00Z", flujo: 14.5, nivel: 2.6, caudal: 980, velocidad: 1.5 },
  { timestamp: "2025-01-08T18:00:00Z", flujo: 13.7, nivel: 2.3, caudal: 915, velocidad: 1.35 },
  { timestamp: "2025-01-09T00:00:00Z", flujo: 15.2, nivel: 2.8, caudal: 1050, velocidad: 1.6 },
  { timestamp: "2025-01-09T06:00:00Z", flujo: 14.8, nivel: 2.7, caudal: 1020, velocidad: 1.55 },
  { timestamp: "2025-01-09T12:00:00Z", flujo: 16.1, nivel: 3.0, caudal: 1120, velocidad: 1.7 },
  { timestamp: "2025-01-09T18:00:00Z", flujo: 15.5, nivel: 2.9, caudal: 1080, velocidad: 1.65 },
];

const mockCriticalEvents = [
  {
    id: 1,
    station_name: "Río Claro Sur",
    water_level: 3.2,
    threshold: 3.0,
    timestamp: "2025-01-13T09:45:00Z",
    duration_minutes: 45,
  },
  {
    id: 2,
    station_name: "Río Claro Norte",
    water_level: 3.1,
    threshold: 3.0,
    timestamp: "2025-01-11T15:20:00Z",
    duration_minutes: 120,
  },
];

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState("daily-average");
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("nivel");
  const [dateRange, setDateRange] = useState({
    start: "2025-01-07",
    end: "2025-01-13",
  });

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gov-black">Análisis de Datos</h1>
          <p className="text-lg text-gov-gray-a">
            Análisis estadísticos, tendencias y reportes técnicos del monitoreo hídrico
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gov-black">
                  <Calendar className="h-5 w-5 text-gov-primary" />
                  <span>Filtros</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gov-black">Fecha Inicio</label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gov-black">Fecha Fin</label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <Button className="w-full bg-gov-primary text-white hover:bg-gov-primary/90">
                  Aplicar Filtros
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Reports Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant={activeTab === "daily-average" ? "default" : "outline"}
                  onClick={() => setActiveTab("daily-average")}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Promedios Diarios</span>
                </Button>

                <Button
                  variant={activeTab === "detailed-analysis" ? "default" : "outline"}
                  onClick={() => setActiveTab("detailed-analysis")}
                  className="flex items-center space-x-2"
                >
                  <Waves className="h-4 w-4" />
                  <span>Análisis Detallado</span>
                </Button>
                
                <Button
                  variant={activeTab === "critical-events" ? "default" : "outline"}
                  onClick={() => setActiveTab("critical-events")}
                  className="flex items-center space-x-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Eventos Críticos</span>
                </Button>
                
                <Button
                  variant={activeTab === "comparative" ? "default" : "outline"}
                  onClick={() => setActiveTab("comparative")}
                  className="flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Comparativo</span>
                </Button>
              </div>

              {/* Daily Average Report */}
              {activeTab === "daily-average" && (
                <Card className="bg-gov-white border-gov-accent">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <CardTitle className="text-gov-black">Promedios Diarios</CardTitle>
                        <CardDescription className="text-gov-gray-a">
                          Promedio diario del nivel del agua por estación
                        </CardDescription>
                      </div>
                      <ExportButton
                        data={ReportActivityService.generateReportActivities('Promedios Diarios')}
                        disabled={false}
                        size="default"
                        className="bg-transparent border-gov-green text-gov-green hover:bg-gov-green hover:text-white"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <NormalizedChart 
                      rawData={mockDailyData}
                      sourceType={DataSourceType.REPORT}
                      height={300}
                    />

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-gov-white border border-gov-accent">
                        <p className="text-xl sm:text-2xl font-bold text-gov-green">2.4m</p>
                        <p className="text-xs sm:text-sm text-gov-gray-a">Promedio General</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gov-white border border-gov-accent">
                        <p className="text-xl sm:text-2xl font-bold text-gov-primary">2.8m</p>
                        <p className="text-xs sm:text-sm text-gov-gray-a">Máximo</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-gov-white border border-gov-accent">
                        <p className="text-xl sm:text-2xl font-bold text-gov-orange">2.1m</p>
                        <p className="text-xs sm:text-sm text-gov-gray-a">Mínimo</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis Report */}
              {activeTab === "detailed-analysis" && (
                <div className="space-y-6">
                  {/* Metric Selector */}
                  <Card className="bg-gov-white border-gov-accent">
                    <CardHeader>
                      <CardTitle className="text-gov-black">Selector de Métrica</CardTitle>
                      <CardDescription className="text-gov-gray-a">
                        Selecciona la métrica para análisis detallado
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Button
                          variant={selectedMetric === "nivel" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("nivel")}
                          className="flex items-center space-x-2 h-auto p-3"
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Nivel</span>
                        </Button>
                        
                        <Button
                          variant={selectedMetric === "flujo" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("flujo")}
                          className="flex items-center space-x-2 h-auto p-3"
                        >
                          <Waves className="h-4 w-4" />
                          <span>Flujo</span>
                        </Button>
                        
                        <Button
                          variant={selectedMetric === "caudal" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("caudal")}
                          className="flex items-center space-x-2 h-auto p-3"
                        >
                          <Droplets className="h-4 w-4" />
                          <span>Caudal</span>
                        </Button>
                        
                        <Button
                          variant={selectedMetric === "velocidad" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("velocidad")}
                          className="flex items-center space-x-2 h-auto p-3"
                        >
                          <Gauge className="h-4 w-4" />
                          <span>Velocidad</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Chart */}
                  <Card className="bg-gov-white border-gov-accent">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div>
                          <CardTitle className="text-gov-black capitalize">
                            Análisis Detallado - {selectedMetric}
                          </CardTitle>
                          <CardDescription className="text-gov-gray-a">
                            Gráfico especializado con datos cada 6 horas
                          </CardDescription>
                        </div>
                        <ExportButton
                          data={ReportActivityService.generateStationMetricsActivities()}
                          disabled={false}
                          size="default"
                          className="bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <MetricChart
                        rawData={mockDetailedMetrics}
                        sourceType={DataSourceType.REPORT}
                        metricType={selectedMetric}
                        height={400}
                        showLegend={true}
                      />
                      
                      {/* Estadísticas detalladas */}
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-gov-white border border-gov-accent">
                          <p className="text-xl font-bold text-gov-green">
                            {selectedMetric === 'nivel' ? '2.4m' : 
                             selectedMetric === 'flujo' ? '13.8 m³/s' :
                             selectedMetric === 'caudal' ? '915 L/s' : '1.35 m/s'}
                          </p>
                          <p className="text-sm text-gov-gray-a">Promedio</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gov-white border border-gov-accent">
                          <p className="text-xl font-bold text-gov-primary">
                            {selectedMetric === 'nivel' ? '3.0m' : 
                             selectedMetric === 'flujo' ? '16.1 m³/s' :
                             selectedMetric === 'caudal' ? '1120 L/s' : '1.7 m/s'}
                          </p>
                          <p className="text-sm text-gov-gray-a">Máximo</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gov-white border border-gov-accent">
                          <p className="text-xl font-bold text-gov-orange">
                            {selectedMetric === 'nivel' ? '2.0m' : 
                             selectedMetric === 'flujo' ? '11.8 m³/s' :
                             selectedMetric === 'caudal' ? '820 L/s' : '1.1 m/s'}
                          </p>
                          <p className="text-sm text-gov-gray-a">Mínimo</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-gov-white border border-gov-accent">
                          <p className="text-xl font-bold text-gov-secondary">
                            {selectedMetric === 'nivel' ? '±0.3m' : 
                             selectedMetric === 'flujo' ? '±1.8 m³/s' :
                             selectedMetric === 'caudal' ? '±125 L/s' : '±0.2 m/s'}
                          </p>
                          <p className="text-sm text-gov-gray-a">Variación</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Critical Events Report */}
              {activeTab === "critical-events" && (
                <Card className="bg-gov-white border-gov-accent">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div>
                        <CardTitle className="text-gov-black">Eventos Críticos</CardTitle>
                        <CardDescription className="text-gov-gray-a">
                          Registros donde el nivel superó el umbral crítico
                        </CardDescription>
                      </div>
                      <ExportButton
                        data={ReportActivityService.generateTrendAnalysisActivities()}
                        disabled={false}
                        size="default"
                        className="bg-transparent border-gov-orange text-gov-orange hover:bg-gov-orange hover:text-white"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCriticalEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-4 rounded-lg border border-gov-secondary bg-gov-white"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-5 w-5 text-gov-secondary" />
                              <div>
                                <p className="font-medium text-gov-black">{event.station_name}</p>
                                <p className="text-xs sm:text-sm text-gov-gray-a">
                                  {new Date(event.timestamp).toLocaleString("es-CL")}
                                </p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="font-bold text-lg sm:text-base text-gov-secondary">
                                {event.water_level}m
                              </p>
                              <p className="text-xs sm:text-sm text-gov-gray-b">
                                Umbral: {event.threshold}m
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-xs sm:text-sm text-gov-gray-a">
                            Duración: {event.duration_minutes} minutos
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comparative Report */}
              {activeTab === "comparative" && (
                <Card className="bg-gov-white border-gov-accent">
                  <CardHeader>
                    <CardTitle className="text-gov-black">Comparativo por Estaciones</CardTitle>
                    <CardDescription className="text-gov-gray-a">
                      Comparación del comportamiento entre estaciones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-gov-gray-b mb-4" />
                      <p className="text-gov-gray-a">Reporte comparativo disponible próximamente</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}