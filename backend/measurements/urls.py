"""
URLs para la app measurements - Módulo 2: Gestión de Variables y Datos

Esta configuración incluye todos los endpoints para:
- RF2.1: Datos en tiempo real
- RF2.2: Almacenamiento de datos
- RF2.3: Historial de mediciones
- RF2.4: Configuración de umbrales
- RF2.5: Sistema de alertas
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    # RF2.1 - Datos en Tiempo Real
    latest_measurement_by_station,
    latest_measurements_all_stations,

    # RF2.2 - Almacenamiento de Datos
    MeasurementCreateView,
    batch_create_measurements,

    # RF2.3 - Historial de Mediciones
    MeasurementListView,
    MeasurementDetailView,
    measurement_statistics,

    # RF2.4 - Configuración de Umbrales
    ThresholdListCreateView,
    ThresholdDetailView,

    # RF2.5 - Alertas
    AlertListView,
    AlertDetailView,
    alert_action,
    active_alerts_summary,

    # Módulo 3 - Reportes
    daily_average_report,
    critical_events_report,
    comparative_report,

    # Configuraciones
    MeasurementConfigurationListCreateView,
    MeasurementConfigurationDetailView,
)

app_name = 'measurements'

urlpatterns = [
    # ========================================
    # RF2.1 - DATOS EN TIEMPO REAL
    # ========================================

    # Última medición de una estación específica
    path(
        'stations/<int:station_id>/latest/',
        latest_measurement_by_station,
        name='latest-measurement-by-station'
    ),

    # Últimas mediciones de todas las estaciones accesibles
    path(
        'latest/',
        latest_measurements_all_stations,
        name='latest-measurements-all'
    ),

    # ========================================
    # RF2.2 - ALMACENAMIENTO DE DATOS
    # ========================================

    # Endpoint principal para recibir mediciones individuales
    path(
        '',
        MeasurementCreateView.as_view(),
        name='measurement-create'
    ),

    # Endpoint para crear múltiples mediciones en lote (PLC optimization)
    path(
        'batch/',
        batch_create_measurements,
        name='measurement-batch-create'
    ),

    # ========================================
    # RF2.3 - HISTORIAL DE MEDICIONES
    # ========================================

    # Lista paginada de mediciones con filtros avanzados
    path(
        'history/',
        MeasurementListView.as_view(),
        name='measurement-list'
    ),

    # Detalle de una medición específica
    path(
        '<int:pk>/',
        MeasurementDetailView.as_view(),
        name='measurement-detail'
    ),

    # Estadísticas agregadas de mediciones
    path(
        'statistics/',
        measurement_statistics,
        name='measurement-statistics'
    ),

    # ========================================
    # RF2.4 - CONFIGURACIÓN DE UMBRALES
    # ========================================

    # Lista y creación de umbrales de alerta
    path(
        'thresholds/',
        ThresholdListCreateView.as_view(),
        name='threshold-list-create'
    ),

    # Detalle, actualización y eliminación de umbrales
    path(
        'thresholds/<int:pk>/',
        ThresholdDetailView.as_view(),
        name='threshold-detail'
    ),

    # ========================================
    # RF2.5 - SISTEMA DE ALERTAS
    # ========================================

    # Lista de alertas con filtros
    path(
        'alerts/',
        AlertListView.as_view(),
        name='alert-list'
    ),

    # Detalle de una alerta específica
    path(
        'alerts/<int:pk>/',
        AlertDetailView.as_view(),
        name='alert-detail'
    ),

    # Acciones sobre alertas (reconocer, resolver, descartar)
    path(
        'alerts/<int:alert_id>/action/',
        alert_action,
        name='alert-action'
    ),

    # Resumen de alertas activas por estación
    path(
        'alerts/active-summary/',
        active_alerts_summary,
        name='active-alerts-summary'
    ),

    # ========================================
    # MÓDULO 3: REPORTES (RF3.1, RF3.2, RF3.3)
    # ========================================

    # RF3.1 - Reporte de Promedios Diarios
    path(
        'reports/daily-averages/',
        daily_average_report,
        name='daily-average-report'
    ),

    # RF3.2 - Reporte de Eventos Críticos
    path(
        'reports/critical-events/',
        critical_events_report,
        name='critical-events-report'
    ),

    # RF3.3 - Reporte Comparativo entre Estaciones
    path(
        'reports/comparative/',
        comparative_report,
        name='comparative-report'
    ),

    # ========================================
    # CONFIGURACIÓN DE MEDICIONES
    # ========================================

    # Configuraciones de medición por estación
    path(
        'configurations/',
        MeasurementConfigurationListCreateView.as_view(),
        name='measurement-config-list-create'
    ),

    # Detalle y actualización de configuraciones
    path(
        'configurations/<int:pk>/',
        MeasurementConfigurationDetailView.as_view(),
        name='measurement-config-detail'
    ),
]

# ========================================
# PATRONES DE URL ADICIONALES OPCIONALES
# ========================================

# Endpoints alternativos para facilitar la integración con frontend
frontend_urlpatterns = [
    # Endpoint directo para dashboard - últimas mediciones
    path(
        'dashboard/latest/',
        latest_measurements_all_stations,
        name='dashboard-latest'
    ),

    # Endpoint directo para panel de alertas
    path(
        'dashboard/alerts/',
        active_alerts_summary,
        name='dashboard-alerts'
    ),
]

# Combinar todas las URLs
urlpatterns += frontend_urlpatterns