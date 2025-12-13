"""
Activity Log Serializers
"""
from rest_framework import serializers
from .models_activity import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    """
    Serializer for Activity Log
    """
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    action_display = serializers.CharField(source='get_action_type_display', read_only=True)
    entity_display = serializers.CharField(source='get_entity_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'user_email',
            'user_name',
            'action_type',
            'action_display',
            'entity_type',
            'entity_display',
            'entity_id',
            'severity',
            'severity_display',
            'description',
            'details',
            'ip_address',
            'user_agent',
            'timestamp',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'timestamp']
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
        return "Sistema"


class ActivityLogCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating Activity Logs
    """
    class Meta:
        model = ActivityLog
        fields = [
            'user',
            'action_type',
            'entity_type',
            'entity_id',
            'severity',
            'description',
            'details',
            'ip_address',
            'user_agent',
        ]
    
    def create(self, validated_data):
        return ActivityLog.log_activity(**validated_data)


class ActivityLogStatsSerializer(serializers.Serializer):
    """
    Serializer for Activity Log Statistics
    """
    total_activities = serializers.IntegerField()
    by_action_type = serializers.DictField()
    by_entity_type = serializers.DictField()
    by_severity = serializers.DictField()
    recent_count = serializers.IntegerField()
    by_user = serializers.ListField()
