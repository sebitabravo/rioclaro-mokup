"""
Activity Log Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from .models_activity import ActivityLog
from .serializers_activity import (
    ActivityLogSerializer,
    ActivityLogCreateSerializer,
    ActivityLogStatsSerializer
)


class ActivityLogViewSet(viewsets.ModelViewSet):
    """ViewSet for Activity Logs"""
    queryset = ActivityLog.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ActivityLogCreateSerializer
        return ActivityLogSerializer
    
    def get_queryset(self):
        queryset = ActivityLog.objects.select_related('user').all()
        
        # Filters
        action_type = self.request.query_params.get('action_type')
        entity_type = self.request.query_params.get('entity_type')
        severity = self.request.query_params.get('severity')
        user_id = self.request.query_params.get('user_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)
        if severity:
            queryset = queryset.filter(severity=severity)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get activity statistics"""
        days = int(request.query_params.get('days', 30))
        cutoff_date = timezone.now() - timedelta(days=days)
        
        queryset = ActivityLog.objects.filter(timestamp__gte=cutoff_date)
        
        total = queryset.count()
        
        by_action = dict(
            queryset.values('action_type')
            .annotate(count=Count('id'))
            .values_list('action_type', 'count')
        )
        
        by_entity = dict(
            queryset.values('entity_type')
            .annotate(count=Count('id'))
            .values_list('entity_type', 'count')
        )
        
        by_severity = dict(
            queryset.values('severity')
            .annotate(count=Count('id'))
            .values_list('severity', 'count')
        )
        
        recent_cutoff = timezone.now() - timedelta(hours=24)
        recent_count = queryset.filter(timestamp__gte=recent_cutoff).count()
        
        by_user = list(
            queryset.values('user__email', 'user__first_name', 'user__last_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        data = {
            'total_activities': total,
            'by_action_type': by_action,
            'by_entity_type': by_entity,
            'by_severity': by_severity,
            'recent_count': recent_count,
            'by_user': by_user,
        }
        
        serializer = ActivityLogStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def cleanup(self, request):
        """Delete old activity logs"""
        days = int(request.data.get('days', 90))
        deleted_count = ActivityLog.cleanup_old_logs(days)
        
        return Response({
            'message': f'Deleted {deleted_count} old activity logs',
            'deleted_count': deleted_count,
            'days': days
        }, status=status.HTTP_200_OK)
