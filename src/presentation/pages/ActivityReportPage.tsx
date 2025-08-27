import { useState, useEffect } from 'react';
import { Navbar } from '@presentation/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { ExportButton } from '@presentation/components/ui/ExportButton';
import {
  Activity,
  Search,
  Filter,
  Download,
  User,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  MoreVertical,
  Eye,
  Settings
} from 'lucide-react';
import { ActivityLog, ActivityLogFilter } from '@domain/entities/ActivityLog';
import { MockActivityLogRepository } from '@infrastructure/adapters/MockActivityLogRepository';
import { formatDateTime } from '@shared/utils/formatters';

// Repositorio mock
const activityLogRepo = new MockActivityLogRepository();

// Mapeo de tipos de actividad a íconos y colores gubernamentales
const activityTypeConfig = {
  user_login: { icon: User, color: 'text-gov-primary', bg: 'bg-gov-primary/10', label: 'Inicio de sesión' },
  user_logout: { icon: User, color: 'text-gov-gray-a', bg: 'bg-gray-50', label: 'Cierre de sesión' },
  station_created: { icon: MapPin, color: 'text-gov-green', bg: 'bg-gov-green/10', label: 'Estación creada' },
  station_updated: { icon: MapPin, color: 'text-gov-orange', bg: 'bg-yellow-50', label: 'Estación actualizada' },
  station_deleted: { icon: MapPin, color: 'text-gov-secondary', bg: 'bg-gov-secondary/10', label: 'Estación eliminada' },
  measurement_recorded: { icon: Activity, color: 'text-gov-green', bg: 'bg-gov-green/10', label: 'Medición registrada' },
  alert_triggered: { icon: AlertTriangle, color: 'text-gov-secondary', bg: 'bg-gov-secondary/10', label: 'Alerta activada' },
  alert_resolved: { icon: CheckCircle, color: 'text-gov-green', bg: 'bg-gov-green/10', label: 'Alerta resuelta' },
  report_generated: { icon: Download, color: 'text-gov-primary', bg: 'bg-gov-primary/10', label: 'Reporte generado' },
  report_downloaded: { icon: Download, color: 'text-gov-purple', bg: 'bg-purple-50', label: 'Reporte descargado' },
  system_maintenance: { icon: Server, color: 'text-gov-orange', bg: 'bg-orange-50', label: 'Mantenimiento' },
  data_export: { icon: Download, color: 'text-gov-primary', bg: 'bg-indigo-50', label: 'Exportación de datos' },
  configuration_changed: { icon: Settings, color: 'text-gov-orange', bg: 'bg-yellow-50', label: 'Configuración modificada' },
  backup_created: { icon: Server, color: 'text-gov-primary', bg: 'bg-gov-primary/10', label: 'Respaldo creado' },
  threshold_updated: { icon: AlertTriangle, color: 'text-gov-orange', bg: 'bg-orange-50', label: 'Umbral actualizado' }
} as const;

// Mapeo de estados a colores gubernamentales
const statusConfig = {
  success: { color: 'text-gov-green', bg: 'bg-gov-green/20', label: 'Exitoso' },
  warning: { color: 'text-gov-orange', bg: 'bg-yellow-100', label: 'Advertencia' },
  error: { color: 'text-gov-secondary', bg: 'bg-gov-secondary/20', label: 'Error' },
  info: { color: 'text-gov-primary', bg: 'bg-gov-primary/20', label: 'Información' }
};

export function ActivityReportPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const filter: ActivityLogFilter = {};
      
      if (searchTerm) filter.search = searchTerm;
      if (selectedStatus) filter.status = [selectedStatus as any];
      if (selectedType) filter.activityTypes = [selectedType as any];

      const [logsData, statsData] = await Promise.all([
        activityLogRepo.findAll(filter),
        activityLogRepo.getStats(filter)
      ]);
      
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [searchTerm, selectedStatus, selectedType]);

  const ActivityIcon = ({ type }: { type: keyof typeof activityTypeConfig }) => {
    const config = activityTypeConfig[type];
    const IconComponent = config?.icon || Activity;
    return <IconComponent className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />;
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return formatDateTime(timestamp);
  };

  return (
    <div className="min-h-screen bg-gov-neutral">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gov-black mb-2">
              Historial del Sistema
            </h1>
            <p className="text-gov-gray-a">
              Registro cronológico de todas las actividades y eventos del sistema
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button
              onClick={loadLogs}
              disabled={loading}
              variant="outline"
              size="sm"
              className="bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
              className="bg-transparent border-gov-accent text-gov-gray-a hover:bg-gov-accent hover:text-gov-black"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <ExportButton
              data={logs}
              disabled={loading || logs.length === 0}
              size="sm"
              className="bg-transparent border-gov-accent text-gov-gray-a hover:bg-gov-accent hover:text-gov-black"
            />
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gov-gray-a">
                  Total Actividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gov-black">{stats.total}</div>
                <p className="text-xs text-gov-gray-b">Últimas 24 horas</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gov-gray-a">
                  Exitosas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gov-green">
                  {stats.byStatus.success || 0}
                </div>
                <p className="text-xs text-gov-gray-b">Sin errores</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gov-gray-a">
                  Advertencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.byStatus.warning || 0}
                </div>
                <p className="text-xs text-gov-gray-b">Requieren atención</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gov-white border-gov-accent">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gov-gray-a">
                  Errores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gov-secondary">
                  {stats.byStatus.error || 0}
                </div>
                <p className="text-xs text-gov-gray-b">Fallos del sistema</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <Card className="bg-gov-white border-gov-accent mb-6">
            <CardHeader>
              <CardTitle className="text-base font-medium text-gov-black">
                Filtros de Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gov-gray-a mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gov-gray-b" />
                    <Input
                      placeholder="Buscar actividad, usuario, estación..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gov-gray-a mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full rounded-md border border-gov-accent bg-gov-white px-3 py-2 text-sm"
                  >
                    <option value="">Todos los estados</option>
                    <option value="success">Exitoso</option>
                    <option value="warning">Advertencia</option>
                    <option value="error">Error</option>
                    <option value="info">Información</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gov-gray-a mb-2">
                    Tipo de Actividad
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full rounded-md border border-gov-accent bg-gov-white px-3 py-2 text-sm"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="user_login">Inicio de sesión</option>
                    <option value="alert_triggered">Alerta activada</option>
                    <option value="report_generated">Reporte generado</option>
                    <option value="station_updated">Estación actualizada</option>
                    <option value="measurement_recorded">Medición registrada</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Log */}
        <Card className="bg-gov-white border-gov-accent">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gov-black">
              <Activity className="h-5 w-5 text-gov-primary" />
              <span>Historial de Actividades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto text-gov-primary mb-4 animate-spin" />
                  <p className="text-gov-gray-a">Cargando actividades...</p>
                </div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto text-gov-gray-b mb-4" />
                  <h3 className="text-lg font-medium text-gov-gray-a mb-2">
                    No hay actividades
                  </h3>
                  <p className="text-gov-gray-b">
                    No se encontraron registros con los filtros aplicados
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => {
                  const config = activityTypeConfig[log.activity_type] || activityTypeConfig.measurement_recorded;
                  const statusConfig_ = statusConfig[log.status];
                  
                  return (
                    <div
                      key={log.id}
                      className="flex items-start space-x-4 p-4 rounded-lg border border-gov-accent hover:bg-gov-neutral transition-colors"
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                        <ActivityIcon type={log.activity_type} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-gov-black">
                                {log.title}
                              </h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig_.bg} ${statusConfig_.color}`}>
                                {statusConfig_.label}
                              </span>
                            </div>
                            
                            <p className="text-sm text-gov-gray-a mb-2">
                              {log.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gov-gray-b">
                              {log.user_name && (
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{log.user_name}</span>
                                </div>
                              )}
                              
                              {log.station_name && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{log.station_name}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{getRelativeTime(log.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
