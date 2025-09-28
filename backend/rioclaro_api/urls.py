"""
URL configuration for rioclaro_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

# Import ViewSets
from users.views import UserViewSet
from stations.views import StationViewSet, StationAssignmentViewSet

# Import health check views
from .health import health_check, health_detailed, ready_check, live_check

# Import monitoring views
from .monitoring import metrics, system_info

# Configure DRF Router
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'stations', StationViewSet)
router.register(r'station-assignments', StationAssignmentViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('api/auth/token/', obtain_auth_token, name='api_token_auth'),

    # Health Check Endpoints
    path('health/', health_check, name='health_check'),
    path('health/detailed/', health_detailed, name='health_detailed'),
    path('health/ready/', ready_check, name='ready_check'),
    path('health/live/', live_check, name='live_check'),

    # Monitoring and Metrics Endpoints
    path('metrics/', metrics, name='metrics'),
    path('system/', system_info, name='system_info'),

    # Módulo 2: Gestión de Variables y Datos
    path('api/measurements/', include('measurements.urls')),
]