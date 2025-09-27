import { useState } from "react";
import { Navbar } from "@shared/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { ReportExportButton } from "@features/reports/components/ReportExportButton";
import { TrendingUp, AlertTriangle, BarChart3, Calendar, Waves, Droplets, Gauge } from "lucide-react";
import { NormalizedChart } from "@features/reports/components/NormalizedChart";
import { MetricChart, MetricType } from "@features/reports/components/MetricChart";
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

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-3 text-gov-black">Análisis de Datos</h1>
              <p className="text-lg text-gov-gray-a max-w-2xl">
                Análisis estadísticos, tendencias y reportes técnicos del monitoreo hídrico para la toma de decisiones informadas
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gov-gray-b">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Última actualización: {new Date().toLocaleDateString("es-CL")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-6">
              <Card className="bg-gov-white border-gov-accent shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2 text-gov-black">
                    <Calendar className="h-5 w-5 text-gov-primary" />
                    <span>Configuración de Filtros</span>
                  </CardTitle>
                  <p className="text-sm text-gov-gray-a">
                    Personaliza el rango de fechas para el análisis
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gov-black mb-2">
                        Fecha de Inicio
                      </label>
                      <Input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gov-black mb-2">
                        Fecha de Fin
                      </label>
                      <Input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                        className="w-full"
                      />
                    </div>

                    <Button className="w-full bg-gov-primary text-white hover:bg-gov-primary/90 transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Aplicar Filtros
                    </Button>
                  </div>

                  {/* Quick Range Buttons */}
                  <div className="pt-4 border-t border-gov-accent">
                    <p className="text-sm font-medium text-gov-black mb-3">Rangos Rápidos</p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        Últimos 7 días
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        Último mes
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        Últimos 3 meses
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reports Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="space-y-8">
              {/* Tab Navigation */}
              <div className="bg-gov-white rounded-lg border border-gov-accent shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gov-black mb-4">Tipos de Análisis</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    variant={activeTab === "daily-average" ? "default" : "outline"}
                    onClick={() => setActiveTab("daily-average")}
                    className="flex flex-col items-center space-y-2 h-auto p-4 text-center"
                  >
                    <TrendingUp className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Promedios</div>
                      <div className="text-xs opacity-75">Diarios</div>
                    </div>
                  </Button>

                  <Button
                    variant={activeTab === "detailed-analysis" ? "default" : "outline"}
                    onClick={() => setActiveTab("detailed-analysis")}
                    className="flex flex-col items-center space-y-2 h-auto p-4 text-center"
                  >
                    <Waves className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Análisis</div>
                      <div className="text-xs opacity-75">Detallado</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={activeTab === "critical-events" ? "default" : "outline"}
                    onClick={() => setActiveTab("critical-events")}
                    className="flex flex-col items-center space-y-2 h-auto p-4 text-center"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Eventos</div>
                      <div className="text-xs opacity-75">Críticos</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant={activeTab === "comparative" ? "default" : "outline"}
                    onClick={() => setActiveTab("comparative")}
                    className="flex flex-col items-center space-y-2 h-auto p-4 text-center"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Comparativo</div>
                      <div className="text-xs opacity-75">Estaciones</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Daily Average Report */}
              {activeTab === "daily-average" && (
                <Card className="bg-gov-white border-gov-accent shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div>
                        <CardTitle className="text-gov-black text-xl mb-2">Promedios Diarios</CardTitle>
                        <CardDescription className="text-gov-gray-a">
                          Promedio diario del nivel del agua por estación durante el período seleccionado
                        </CardDescription>
                      </div>
                      <ReportExportButton
                        data={ReportActivityService.generateReportActivities('Promedios Diarios')}
                        disabled={false}
                        size="default"
                        className="bg-transparent border-gov-green text-gov-green hover:bg-gov-green hover:text-white transition-all"
                        reportType="promedios_diarios"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <NormalizedChart 
                        rawData={mockDailyData}
                        sourceType={DataSourceType.REPORT}
                        height={350}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-gov-green/5 to-gov-green/10 rounded-lg p-4 border border-gov-green/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gov-green/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-gov-green" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gov-green">2.4m</p>
                            <p className="text-sm text-gov-gray-a">Promedio General</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-gov-primary/5 to-gov-primary/10 rounded-lg p-4 border border-gov-primary/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gov-primary/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gov-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gov-primary">2.8m</p>
                            <p className="text-sm text-gov-gray-a">Máximo Registrado</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-gov-orange/5 to-gov-orange/10 rounded-lg p-4 border border-gov-orange/20">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gov-orange/10 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gov-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gov-orange">2.1m</p>
                            <p className="text-sm text-gov-gray-a">Mínimo Registrado</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Analysis Report */}
              {activeTab === "detailed-analysis" && (
                <div className="space-y-6">
                  {/* Metric Selector */}
                  <Card className="bg-gov-white border-gov-accent shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-gov-black text-lg">Selector de Métrica</CardTitle>
                      <CardDescription className="text-gov-gray-a">
                        Selecciona la métrica específica que deseas analizar en detalle
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <Button
                          variant={selectedMetric === "nivel" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("nivel")}
                          className="flex flex-col items-center space-y-2 h-auto p-4"
                        >
                          <BarChart3 className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Nivel</div>
                            <div className="text-xs opacity-75">del Agua</div>
                          </div>
                        </Button>
                        
                        <Button
                          variant={selectedMetric === "flujo" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("flujo")}
                          className="flex flex-col items-center space-y-2 h-auto p-4"
                        >
                          <Waves className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Flujo</div>
                            <div className="text-xs opacity-75">de Agua</div>
                          </div>
                        </Button>
                        
                        <Button
                          variant={selectedMetric === "caudal" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("caudal")}
                          className="flex flex-col items-center space-y-2 h-auto p-4"
                        >
                          <Droplets className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Caudal</div>
                            <div className="text-xs opacity-75">Medido</div>
                          </div>
                        </Button>
                        
                        <Button
                          variant={selectedMetric === "velocidad" ? "default" : "outline"}
                          onClick={() => setSelectedMetric("velocidad")}
                          className="flex flex-col items-center space-y-2 h-auto p-4"
                        >
                          <Gauge className="h-5 w-5" />
                          <div>
                            <div className="font-medium">Velocidad</div>
                            <div className="text-xs opacity-75">del Flujo</div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Chart */}
                  <Card className="bg-gov-white border-gov-accent shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div>
                          <CardTitle className="text-gov-black text-xl mb-2 capitalize">
                            Análisis Detallado - {selectedMetric}
                          </CardTitle>
                          <CardDescription className="text-gov-gray-a">
                            Gráfico especializado con datos cada 6 horas para análisis granular
                          </CardDescription>
                        </div>
                        <ReportExportButton
                          data={ReportActivityService.generateStationMetricsActivities()}
                          disabled={false}
                          size="default"
                          className="bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white transition-all"
                          reportType="analisis_detallado"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-6">
                        <MetricChart
                          rawData={mockDetailedMetrics}
                          sourceType={DataSourceType.REPORT}
                          metricType={selectedMetric}
                          height={400}
                          showLegend={true}
                        />
                      </div>
                      
                      {/* Estadísticas detalladas */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-gov-green/5 to-gov-green/10 rounded-lg p-4 border border-gov-green/20">
                          <div className="text-center">
                            <p className="text-xl font-bold text-gov-green">
                              {selectedMetric === 'nivel' ? '2.4m' : 
                               selectedMetric === 'flujo' ? '13.8 m³/s' :
                               selectedMetric === 'caudal' ? '915 L/s' : '1.35 m/s'}
                            </p>
                            <p className="text-sm text-gov-gray-a">Promedio</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-gov-primary/5 to-gov-primary/10 rounded-lg p-4 border border-gov-primary/20">
                          <div className="text-center">
                            <p className="text-xl font-bold text-gov-primary">
                              {selectedMetric === 'nivel' ? '3.0m' : 
                               selectedMetric === 'flujo' ? '16.1 m³/s' :
                               selectedMetric === 'caudal' ? '1120 L/s' : '1.7 m/s'}
                            </p>
                            <p className="text-sm text-gov-gray-a">Máximo</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-gov-orange/5 to-gov-orange/10 rounded-lg p-4 border border-gov-orange/20">
                          <div className="text-center">
                            <p className="text-xl font-bold text-gov-orange">
                              {selectedMetric === 'nivel' ? '2.0m' : 
                               selectedMetric === 'flujo' ? '11.8 m³/s' :
                               selectedMetric === 'caudal' ? '820 L/s' : '1.1 m/s'}
                            </p>
                            <p className="text-sm text-gov-gray-a">Mínimo</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-gov-secondary/5 to-gov-secondary/10 rounded-lg p-4 border border-gov-secondary/20">
                          <div className="text-center">
                            <p className="text-xl font-bold text-gov-secondary">
                              {selectedMetric === 'nivel' ? '±0.3m' : 
                               selectedMetric === 'flujo' ? '±1.8 m³/s' :
                               selectedMetric === 'caudal' ? '±125 L/s' : '±0.2 m/s'}
                            </p>
                            <p className="text-sm text-gov-gray-a">Variación</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Critical Events Report */}
              {activeTab === "critical-events" && (
                <Card className="bg-gov-white border-gov-accent shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div>
                        <CardTitle className="text-gov-black text-xl mb-2">Eventos Críticos</CardTitle>
                        <CardDescription className="text-gov-gray-a">
                          Registros históricos donde el nivel del agua superó los umbrales críticos establecidos
                        </CardDescription>
                      </div>
                      <ReportExportButton
                        data={ReportActivityService.generateTrendAnalysisActivities()}
                        disabled={false}
                        size="default"
                        className="bg-transparent border-gov-orange text-gov-orange hover:bg-gov-orange hover:text-white transition-all"
                        reportType="eventos_criticos"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCriticalEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-gradient-to-r from-gov-secondary/5 to-transparent rounded-lg border border-gov-secondary/20 p-6"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full bg-gov-secondary/10 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="h-6 w-6 text-gov-secondary" />
                              </div>
                              <div>
                                <p className="font-semibold text-gov-black text-lg">{event.station_name}</p>
                                <p className="text-sm text-gov-gray-a">
                                  {new Date(event.timestamp).toLocaleString("es-CL", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                                <p className="text-sm text-gov-gray-b">
                                  Duración del evento: {event.duration_minutes} minutos
                                </p>
                              </div>
                            </div>
                            <div className="bg-gov-white rounded-lg p-4 border border-gov-accent">
                              <div className="text-center">
                                <p className="font-bold text-2xl text-gov-secondary mb-1">
                                  {event.water_level}m
                                </p>
                                <p className="text-sm text-gov-gray-b">
                                  Umbral: {event.threshold}m
                                </p>
                                <div className="mt-2 w-full bg-gov-accent rounded-full h-2">
                                  <div 
                                    className="bg-gov-secondary h-2 rounded-full" 
                                    style={{ width: `${Math.min((event.water_level / event.threshold) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comparative Report */}
              {activeTab === "comparative" && (
                <Card className="bg-gov-white border-gov-accent shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-gov-black text-xl mb-2">Comparativo por Estaciones</CardTitle>
                    <CardDescription className="text-gov-gray-a">
                      Análisis comparativo del comportamiento hídrico entre diferentes estaciones de monitoreo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gov-gray-b/10 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-gov-gray-b" />
                      </div>
                      <h3 className="text-lg font-semibold text-gov-black mb-2">Funcionalidad en Desarrollo</h3>
                      <p className="text-gov-gray-a max-w-md mx-auto">
                        El reporte comparativo estará disponible próximamente. Esta función permitirá analizar 
                        y comparar el comportamiento de múltiples estaciones de monitoreo.
                      </p>
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
