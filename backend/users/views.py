from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from .serializers import UserSerializer, UserListSerializer
from .ratelimit import admin_ratelimit, api_ratelimit
from .security_logging import log_security_event, SecurityEventTypes
from .validators import APIParameterValidator, InputSanitizer
import logging

User = get_user_model()
logger = logging.getLogger('rioclaro.security')


@method_decorator(admin_ratelimit, name='dispatch')
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return UserListSerializer
        return UserSerializer

    def get_permissions(self):
        """Solo administradores pueden gestionar usuarios (RF1.1)"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAuthenticated, self.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    class IsAdminUser(permissions.BasePermission):
        """Permiso personalizado para verificar que el usuario sea administrador"""
        def has_permission(self, request, view):
            return request.user and request.user.is_authenticated and request.user.is_admin()

    def destroy(self, request, *args, **kwargs):
        """RF1.3: Validaciones antes de eliminar usuario"""
        user = self.get_object()

        # Log intento de eliminación
        log_security_event(
            SecurityEventTypes.USER_DELETED,
            f"User deletion attempt by {request.user.username} for user {user.username}",
            logging.WARNING,
            requesting_user=str(request.user),
            target_user=str(user),
            ip_address=request.META.get('REMOTE_ADDR')
        )

        # No permitir eliminar el propio usuario
        if user == request.user:
            return Response(
                {'error': 'No puedes eliminar tu propio usuario.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # No permitir eliminar el último administrador
        if user.is_admin() and User.objects.filter(role='admin').count() <= 1:
            return Response(
                {'error': 'No se puede eliminar el último administrador del sistema.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Log eliminación exitosa
        log_security_event(
            SecurityEventTypes.USER_DELETED,
            f"User deleted successfully: {user.username} by {request.user.username}",
            logging.CRITICAL,
            deleted_user=str(user),
            requesting_user=str(request.user),
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    @api_ratelimit
    def me(self, request):
        """Endpoint para obtener información del usuario autenticado"""
        # Log acceso a datos personales
        log_security_event(
            SecurityEventTypes.SENSITIVE_DATA_ACCESS,
            f"User profile access by {request.user.username}",
            logging.INFO,
            user=str(request.user),
            endpoint='/me',
            ip_address=request.META.get('REMOTE_ADDR')
        )

        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roles(self, request):
        """Endpoint para obtener los roles disponibles"""
        from .models import UserRole
        roles = [{'value': choice[0], 'label': choice[1]} for choice in UserRole.choices]
        return Response(roles)