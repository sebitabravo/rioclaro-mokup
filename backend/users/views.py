from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserListSerializer

User = get_user_model()


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

        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Endpoint para obtener información del usuario autenticado"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roles(self, request):
        """Endpoint para obtener los roles disponibles"""
        from .models import UserRole
        roles = [{'value': choice[0], 'label': choice[1]} for choice in UserRole.choices]
        return Response(roles)