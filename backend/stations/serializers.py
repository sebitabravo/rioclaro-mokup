from rest_framework import serializers
from .models import Station, StationAssignment
from users.serializers import UserListSerializer


class StationSerializer(serializers.ModelSerializer):
    has_active_sensors = serializers.ReadOnlyField()
    location = serializers.ReadOnlyField()
    assigned_users = UserListSerializer(many=True, read_only=True)

    class Meta:
        model = Station
        fields = [
            'id', 'name', 'code', 'latitude', 'longitude', 'location',
            'description', 'is_active', 'has_active_sensors',
            'assigned_users', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate_code(self, value):
        """Validar que el código sea único (RF1.2)"""
        instance = getattr(self, 'instance', None)
        if Station.objects.filter(code=value).exclude(pk=instance.pk if instance else None).exists():
            raise serializers.ValidationError("Ya existe una estación con este código.")
        return value.upper()


class StationListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados"""
    has_active_sensors = serializers.ReadOnlyField()
    assigned_users_count = serializers.SerializerMethodField()

    class Meta:
        model = Station
        fields = [
            'id', 'name', 'code', 'latitude', 'longitude',
            'is_active', 'has_active_sensors', 'assigned_users_count'
        ]

    def get_assigned_users_count(self, obj):
        return obj.assigned_users.count()


class StationAssignmentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    station_name = serializers.SerializerMethodField()
    assigned_by_name = serializers.SerializerMethodField()

    class Meta:
        model = StationAssignment
        fields = [
            'id', 'user', 'station', 'user_name', 'station_name',
            'assigned_by', 'assigned_by_name', 'assigned_at'
        ]
        read_only_fields = ['assigned_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_station_name(self, obj):
        return obj.station.name

    def get_assigned_by_name(self, obj):
        return obj.assigned_by.get_full_name() if obj.assigned_by else None