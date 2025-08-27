import { ActivityLog } from '@domain/entities/ActivityLog';

/**
 * Servicio para generar logs de actividad a partir de datos de reportes
 */
export class ReportActivityService {
  /**
   * Genera logs de actividad para exportación desde datos de reportes
   */
  static generateReportActivities(reportType: string): ActivityLog[] {
    const now = new Date();
    const logs: ActivityLog[] = [];

    // Simular actividades de generación de reportes
    const activities = [
      {
        activity_type: 'report_generated' as const,
        title: `Reporte ${reportType} generado`,
        description: `Se generó exitosamente el reporte de ${reportType}`,
        status: 'success' as const,
        timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 min ago
        created_at: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        user_name: 'Sistema de Monitoreo',
        station_name: 'Todas las estaciones',
        ip_address: '192.168.1.100',
        metadata: {
          report_type: reportType,
          stations_included: ['Río Claro Norte', 'Río Claro Sur', 'Estación Central'],
          data_points: 1250,
          period: '7 días'
        }
      },
      {
        activity_type: 'data_export' as const,
        title: 'Datos procesados para análisis',
        description: `Procesamiento de datos para reporte de ${reportType}`,
        status: 'success' as const,
        timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString(), // 45 min ago
        created_at: new Date(now.getTime() - 1000 * 60 * 45).toISOString(),
        user_name: 'Sistema de Análisis',
        station_name: 'Procesamiento Central',
        ip_address: '192.168.1.101',
        metadata: {
          processing_time: '2.3 segundos',
          data_quality: 'Alta',
          normalization_applied: true
        }
      },
      {
        activity_type: 'measurement_recorded' as const,
        title: 'Mediciones incluidas en análisis',
        description: 'Últimas mediciones incorporadas al análisis estadístico',
        status: 'success' as const,
        timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        created_at: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
        user_name: 'Sensor de Campo',
        station_name: 'Río Claro Norte',
        ip_address: '192.168.1.102',
        metadata: {
          nivel_agua: '2.35m',
          flujo: '14.2 m³/s',
          calidad_agua: 'Buena'
        }
      },
      {
        activity_type: 'threshold_updated' as const,
        title: 'Umbrales de alerta verificados',
        description: 'Verificación de umbrales para alertas automáticas',
        status: 'info' as const,
        timestamp: new Date(now.getTime() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
        created_at: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
        user_name: 'Sistema de Monitoreo',
        station_name: 'Todas las estaciones',
        ip_address: '192.168.1.100',
        metadata: {
          threshold_nivel: '3.0m',
          threshold_flujo: '25.0 m³/s',
          alertas_activas: 0
        }
      },
      {
        activity_type: 'report_downloaded' as const,
        title: 'Reporte anterior descargado',
        description: 'Descarga del reporte diario previo',
        status: 'success' as const,
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        user_name: 'Analista de Datos',
        station_name: 'Portal Web',
        ip_address: '192.168.1.200',
        metadata: {
          formato: 'PDF',
          tamaño: '2.4 MB',
          tiempo_descarga: '1.2s'
        }
      }
    ];

    // Generar más actividades históricas
    for (let i = 0; i < 20; i++) {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const hoursAgo = Math.floor(Math.random() * 168) + 1; // Últimas 7 días
      
      logs.push({
        id: Date.now() + i, // Generar ID numérico único
        ...randomActivity,
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * hoursAgo).toISOString(),
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * hoursAgo).toISOString(),
        metadata: {
          ...randomActivity.metadata,
          generated_for_report: reportType,
          sequence_number: i + 1
        }
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Genera logs de actividad específicos para métricas de estaciones
   */
  static generateStationMetricsActivities(): ActivityLog[] {
    const now = new Date();
    const stations = ['Río Claro Norte', 'Río Claro Sur', 'Estación Central', 'Punto de Control'];
    const metrics = ['nivel_agua', 'flujo', 'velocidad', 'caudal'];
    const logs: ActivityLog[] = [];

    for (let i = 0; i < 30; i++) {
      const station = stations[Math.floor(Math.random() * stations.length)];
      const metric = metrics[Math.floor(Math.random() * metrics.length)];
      const hoursAgo = Math.floor(Math.random() * 72) + 1; // Últimos 3 días
      
      logs.push({
        id: Date.now() + i + 1000, // ID numérico único
        activity_type: 'measurement_recorded',
        title: `Medición de ${metric.replace('_', ' ')} registrada`,
        description: `Nueva medición de ${metric.replace('_', ' ')} en ${station}`,
        status: Math.random() > 0.1 ? 'success' : 'warning',
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * hoursAgo).toISOString(),
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * hoursAgo).toISOString(),
        user_name: 'Sensor Automático',
        station_name: station,
        ip_address: `192.168.1.${100 + Math.floor(Math.random() * 20)}`,
        metadata: {
          metric_type: metric,
          value: (Math.random() * 10 + 1).toFixed(2),
          unit: metric === 'nivel_agua' ? 'm' : metric === 'flujo' ? 'm³/s' : metric === 'velocidad' ? 'm/s' : 'l/s',
          quality_score: (Math.random() * 0.3 + 0.7).toFixed(2), // Entre 0.7 y 1.0
          sensor_status: 'operational'
        }
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Genera logs para análisis de tendencias
   */
  static generateTrendAnalysisActivities(): ActivityLog[] {
    const now = new Date();
    const logs: ActivityLog[] = [];

    const trendActivities = [
      {
        activity_type: 'report_generated' as const,
        title: 'Análisis de tendencias completado',
        description: 'Análisis estadístico de tendencias de los últimos 30 días',
        status: 'success' as const,
        metadata: {
          trend_direction: 'estable',
          confidence_level: '94%',
          data_points: 2880,
          period: '30 días'
        }
      },
      {
        activity_type: 'data_export' as const,
        title: 'Datos de tendencias procesados',
        description: 'Procesamiento de datos históricos para análisis de patrones',
        status: 'success' as const,
        metadata: {
          algorithm: 'Linear Regression',
          r_squared: '0.87',
          processing_time: '15.2 segundos'
        }
      },
      {
        activity_type: 'alert_triggered' as const,
        title: 'Tendencia anómala detectada',
        description: 'Se detectó un patrón irregular en los datos de flujo',
        status: 'warning' as const,
        metadata: {
          anomaly_type: 'sudden_increase',
          severity: 'medium',
          affected_stations: 2
        }
      }
    ];

    for (let i = 0; i < 15; i++) {
      const randomActivity = trendActivities[Math.floor(Math.random() * trendActivities.length)];
      const hoursAgo = Math.floor(Math.random() * 120) + 1; // Últimos 5 días
      
      logs.push({
        id: Date.now() + i + 2000, // ID numérico único
        ...randomActivity,
        timestamp: new Date(now.getTime() - 1000 * 60 * 60 * hoursAgo).toISOString(),
        created_at: new Date(now.getTime() - 1000 * 60 * 60 * hoursAgo).toISOString(),
        user_name: 'Sistema de Análisis',
        station_name: 'Análisis Central',
        ip_address: '192.168.1.150',
        metadata: {
          ...randomActivity.metadata,
          analysis_id: `trend_${i + 1}`,
          generated_at: new Date().toISOString()
        }
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
