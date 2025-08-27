import { Button } from "@presentation/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Activity, BarChart3, AlertTriangle, Users, MapPin, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Navbar } from "@presentation/components/layout/Navbar";
import { MotionWrapper } from "@shared/components/MotionWrapper";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-gov-neutral dark:bg-gov-neutral">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header principal */}
        <MotionWrapper variant="fadeIn">
          <div className="text-center mb-12 md:mb-16">
            <motion.div 
              className="flex items-center justify-center mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Activity className="h-8 w-8 md:h-12 md:w-12 mr-3 md:mr-4 text-gov-primary" />
              <h1 className="text-2xl md:text-4xl font-bold text-gov-black dark:text-gov-black">Sistema Monitoreo Río Claro</h1>
            </motion.div>

            {/* Badge gobierno */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gov-primary text-white">
                <Shield className="h-4 w-4 mr-2" />
                Gobierno de Chile - Región de La Araucanía
              </div>
            </motion.div>

            <motion.p 
              className="text-lg md:text-xl max-w-3xl mx-auto text-gov-gray-a leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Sistema de monitoreo en tiempo real del nivel de agua del Río Claro mediante sensores y generación de
              alertas preventivas para la seguridad de la comunidad de Pucón.
            </motion.p>
          </div>
        </MotionWrapper>

        {/* Cards de características */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.8
              }
            }
          }}
        >
          <motion.div variants={cardVariants}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 bg-gov-white dark:bg-gov-white border-gov-accent dark:border-gov-accent">
              <CardHeader className="text-center pb-3">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gov-primary" />
                <CardTitle className="text-base md:text-lg text-gov-black dark:text-gov-black">Monitoreo en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gov-gray-a text-center">
                  Visualización continua del nivel del agua con actualizaciones automáticas cada 30 segundos
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 bg-gov-white dark:bg-gov-white border-gov-accent dark:border-gov-accent">
              <CardHeader className="text-center pb-3">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gov-secondary" />
                <CardTitle className="text-base md:text-lg text-gov-black dark:text-gov-black">Alertas Preventivas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gov-gray-a text-center">
                  Sistema automático de alertas cuando se superan los niveles críticos establecidos
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 bg-gov-white dark:bg-gov-white border-gov-accent dark:border-gov-accent">
              <CardHeader className="text-center pb-3">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gov-green" />
                <CardTitle className="text-base md:text-lg text-gov-black dark:text-gov-black">Reportes Históricos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gov-gray-a text-center">
                  Análisis de datos históricos y generación de reportes comparativos entre estaciones
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="hover:shadow-lg transition-all hover:scale-105 bg-gov-white dark:bg-gov-white border-gov-accent dark:border-gov-accent">
              <CardHeader className="text-center pb-3">
                <Users className="h-8 w-8 mx-auto mb-2 text-gov-purple" />
                <CardTitle className="text-base md:text-lg text-gov-black dark:text-gov-black">Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-gov-gray-a text-center">
                  Control de acceso con diferentes roles: Administrador, Técnico, Observador
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Estadísticas principales */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.15,
                delayChildren: 1.2
              }
            }
          }}
        >
          <motion.div variants={cardVariants}>
            <Card className="bg-gov-primary text-white border-0 hover:scale-105 transition-transform">
              <CardHeader className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <CardTitle className="text-2xl md:text-3xl font-bold">3</CardTitle>
                <CardDescription className="text-gov-white/70">Estaciones Activas</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gov-green text-white border-0 hover:scale-105 transition-transform">
              <CardHeader className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <CardTitle className="text-2xl md:text-3xl font-bold">2.45m</CardTitle>
                <CardDescription className="text-gov-white/70">Nivel Promedio Actual</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card className="bg-gov-secondary text-white border-0 hover:scale-105 transition-transform">
              <CardHeader className="text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <CardTitle className="text-2xl md:text-3xl font-bold">1</CardTitle>
                <CardDescription className="text-gov-white/70">Alerta Activa</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Botones de acción */}
        <motion.div 
          className="text-center space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="w-full md:w-auto bg-gov-primary hover:bg-gov-primary/90 text-white">
              <Link to="/dashboard">Ver Dashboard</Link>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full md:w-auto bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white dark:border-gov-primary dark:text-gov-primary"
            >
              <Link to="/reports">Ver Reportes</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}