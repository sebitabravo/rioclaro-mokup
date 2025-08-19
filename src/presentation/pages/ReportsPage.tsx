import { useState } from "react";
import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { Input } from "@presentation/components/ui/input";
import { TrendingUp, AlertTriangle, BarChart3, Download, Calendar } from "lucide-react";
import { useReportStore } from "@presentation/stores/ReportStore";
import { NormalizedChart } from "@presentation/components/charts/NormalizedChart";
import { DataSourceType } from "@shared/services/DataNormalizationService";

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
  const [dateRange, setDateRange] = useState({
    start: "2025-01-07",
    end: "2025-01-13",
  });

  const { exporting, exportReport } = useReportStore();

  const handleExportReport = async (reportType: string) => {
    try {
      await exportReport(reportType, {
        start_date: dateRange.start,
        end_date: dateRange.end,
      }, 'csv');
    } catch (error) {
      console.error('Error al exportar reporte:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gov-black">Reportes</h1>
          <p className="text-lg text-gov-gray-a">
            Análisis y reportes históricos del sistema de monitoreo
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
                      <Button
                        variant="outline"
                        className="bg-transparent border-gov-green text-gov-green hover:bg-gov-green hover:text-white"
                        onClick={() => handleExportReport('daily-average')}
                        disabled={exporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {exporting ? "Exportando..." : "Exportar"}
                      </Button>
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
                      <Button
                        variant="outline"
                        className="bg-transparent border-gov-orange text-gov-orange hover:bg-gov-orange hover:text-white"
                        onClick={() => handleExportReport('critical-events')}
                        disabled={exporting}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {exporting ? "Exportando..." : "Exportar"}
                      </Button>
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