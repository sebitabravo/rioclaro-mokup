import { Button } from "@presentation/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Activity, BarChart3, AlertTriangle, Users, MapPin, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="min-h-screen bg-gov-neutral">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header principal */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center mb-6">
            <Activity className="h-8 w-8 md:h-12 md:w-12 mr-3 md:mr-4 text-gov-primary" />
            <h1 className="text-2xl md:text-4xl font-bold text-gov-black">Sistema Monitoreo Río Claro</h1>
          </div>

          {/* Badge gobierno */}
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gov-primary text-white">
              <Shield className="h-4 w-4 mr-2" />
              Gobierno de Chile - Región de La Araucanía
            </div>
          </div>

          <p className="text-lg md:text-xl max-w-3xl mx-auto text-gov-gray-a leading-relaxed">
            Sistema de monitoreo en tiempo real del nivel de agua del Río Claro mediante sensores y generación de
            alertas preventivas para la seguridad de la comunidad de Pucón.
          </p>
        </div>

        {/* Cards de características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow bg-gov-white border-gov-accent">
            <CardHeader className="text-center pb-3">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gov-primary" />
              <CardTitle className="text-base md:text-lg text-gov-black">Monitoreo en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gov-gray-a text-center">
                Visualización continua del nivel del agua con actualizaciones automáticas cada 30 segundos
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gov-white border-gov-accent">
            <CardHeader className="text-center pb-3">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gov-secondary" />
              <CardTitle className="text-base md:text-lg text-gov-black">Alertas Preventivas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gov-gray-a text-center">
                Sistema automático de alertas cuando se superan los niveles críticos establecidos
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gov-white border-gov-accent">
            <CardHeader className="text-center pb-3">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gov-green" />
              <CardTitle className="text-base md:text-lg text-gov-black">Reportes Históricos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gov-gray-a text-center">
                Análisis de datos históricos y generación de reportes comparativos entre estaciones
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gov-white border-gov-accent">
            <CardHeader className="text-center pb-3">
              <Users className="h-8 w-8 mx-auto mb-2 text-gov-purple" />
              <CardTitle className="text-base md:text-lg text-gov-black">Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-gov-gray-a text-center">
                Control de acceso con diferentes roles: Administrador, Técnico, Observador
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <Card className="bg-gov-primary text-white border-0">
            <CardHeader className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <CardTitle className="text-2xl md:text-3xl font-bold">3</CardTitle>
              <CardDescription className="text-gov-white/70">Estaciones Activas</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gov-green text-white border-0">
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2" />
              <CardTitle className="text-2xl md:text-3xl font-bold">2.45m</CardTitle>
              <CardDescription className="text-gov-white/70">Nivel Promedio Actual</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gov-secondary text-white border-0">
            <CardHeader className="text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <CardTitle className="text-2xl md:text-3xl font-bold">1</CardTitle>
              <CardDescription className="text-gov-white/70">Alerta Activa</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Botones de acción */}
        <div className="text-center space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
          <Button asChild size="lg" className="w-full md:w-auto bg-gov-primary hover:bg-gov-primary/90 text-white">
            <Link to="/dashboard">Ver Dashboard</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full md:w-auto bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white"
          >
            <Link to="/stations">Ver Estaciones</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}