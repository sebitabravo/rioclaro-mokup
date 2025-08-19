import { Navbar } from "@presentation/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { AlertTriangle, Settings, Activity } from "lucide-react";

export function AlertsPage() {
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
                <span>Alertas Activas</span>
              </CardTitle>
              <CardDescription>Estado actual de las alertas del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gov-secondary text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Estación Río Claro Sur</p>
                        <p className="text-sm opacity-90">Nivel del agua superó el umbral crítico (3.2m &gt; 3.0m)</p>
                      </div>
                    </div>
                  </div>
                </div>
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
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-gov-gray-b mb-4" />
                <p className="text-gov-gray-a">Configuración de umbrales disponible próximamente</p>
              </div>
            </CardContent>
          </Card>

          {/* Módulos Variables */}
          <Card className="bg-gov-white border-gov-accent">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gov-black">
                <Activity className="h-5 w-5 text-gov-primary" />
                <span>Gestión de Módulos</span>
              </CardTitle>
              <CardDescription>Activar o desactivar módulos de monitoreo adicionales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div>
                    <p className="font-medium text-gov-black">Monitoreo de Nivel de Agua</p>
                    <p className="text-sm text-gov-gray-b">Módulo principal del sistema (obligatorio)</p>
                  </div>
                  <div className="text-sm font-medium text-blue-600">Activo</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gov-white border border-gov-accent">
                  <div>
                    <p className="font-medium text-gov-black">Monitoreo de Turbidez</p>
                    <p className="text-sm text-gov-gray-b">Medición de calidad del agua</p>
                  </div>
                  <div className="text-sm font-medium text-gov-gray-a">Inactivo</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gov-white border border-gov-accent">
                  <div>
                    <p className="font-medium text-gov-black">Monitoreo de Temperatura</p>
                    <p className="text-sm text-gov-gray-b">Temperatura del agua y ambiente</p>
                  </div>
                  <div className="text-sm font-medium text-gov-gray-a">Inactivo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}