from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Station, StationAssignment
from .serializers import StationSerializer, StationListSerializer, StationAssignmentSerializer

User = get_user_model()


class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return StationListSerializer
        return StationSerializer

    def get_permissions(self):
        """Solo administradores pueden gestionar estaciones (RF1.2)"""
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
        """RF1.3: No permitir eliminar estaciones con sensores activos"""
        station = self.get_object()

        if station.has_active_sensors():
            return Response(
                {
                    'error': 'No se puede eliminar una estación con sensores activos. '
                            'Desactive todos los sensores primero.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign_user(self, request, pk=None):
        """RF1.4: Asignar usuario a estación"""
        if not request.user.is_admin():
            return Response(
                {'error': 'Solo los administradores pueden asignar usuarios a estaciones.'},
                status=status.HTTP_403_FORBIDDEN
            )

        station = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)

            # Verificar si ya está asignado
            if StationAssignment.objects.filter(user=user, station=station).exists():
                return Response(
                    {'error': 'El usuario ya está asignado a esta estación.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Crear la asignación
            assignment = StationAssignment.objects.create(
                user=user,
                station=station,
                assigned_by=request.user
            )

            serializer = StationAssignmentSerializer(assignment)
            return Response(
                {
                    'message': 'Usuario asignado correctamente',
                    'assignment': serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        except User.DoesNotExist:
            return Response(
                {'error': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def unassign_user(self, request, pk=None):
        """RF1.4: Desasignar usuario de estación"""
        if not request.user.is_admin():
            return Response(
                {'error': 'Solo los administradores pueden desasignar usuarios de estaciones.'},
                status=status.HTTP_403_FORBIDDEN
            )

        station = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            assignment = StationAssignment.objects.get(user_id=user_id, station=station)
            assignment.delete()

            return Response(
                {'message': 'Usuario desasignado correctamente'},
                status=status.HTTP_200_OK
            )

        except StationAssignment.DoesNotExist:
            return Response(
                {'error': 'El usuario no está asignado a esta estación.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        """Obtener asignaciones de una estación"""
        station = self.get_object()
        assignments = StationAssignment.objects.filter(station=station)
        serializer = StationAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class StationAssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para gestionar asignaciones"""
    queryset = StationAssignment.objects.all()
    serializer_class = StationAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filtrar por usuario si no es admin"""
        if self.request.user.is_admin():
            return StationAssignment.objects.all()
        else:
            return StationAssignment.objects.filter(user=self.request.user)