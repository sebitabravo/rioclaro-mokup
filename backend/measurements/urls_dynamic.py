"""
URLs para el Módulo 4: Escalabilidad y Módulos Adicionales
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views_dynamic

# Router para ViewSets
router = DefaultRouter()
router.register(r'sensor-categories', views_dynamic.SensorTypeCategoryViewSet, basename='sensor-categories')
router.register(r'dynamic-sensors', views_dynamic.DynamicSensorTypeViewSet, basename='dynamic-sensors')
router.register(r'modules', views_dynamic.ModuleConfigurationViewSet, basename='modules')
router.register(r'extensible-measurements', views_dynamic.ExtensibleMeasurementViewSet, basename='extensible-measurements')

# URLs específicas para el módulo 4
urlpatterns = [
    # ViewSets del router
    path('', include(router.urls)),

    # Vistas funcionales específicas
    path('system/modules-overview/', views_dynamic.system_modules_overview, name='system-modules-overview'),
    path('system/sensor-ecosystem/', views_dynamic.sensor_ecosystem_overview, name='sensor-ecosystem-overview'),
]
