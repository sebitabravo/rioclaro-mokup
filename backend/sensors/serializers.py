from rest_framework import serializers
from .models import Sensor, SensorReading


class SensorSerializer(serializers.ModelSerializer):
    station_name = serializers.SerializerMethodField()

    class Meta:
        model = Sensor
        fields = [
            'id', 'station', 'station_name', 'name', 'sensor_type',
            'unit', 'is_active', 'calibration_factor',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_station_name(self, obj):
        return obj.station.name


class SensorReadingSerializer(serializers.ModelSerializer):
    sensor_name = serializers.SerializerMethodField()

    class Meta:
        model = SensorReading
        fields = ['id', 'sensor', 'sensor_name', 'value', 'timestamp']
        read_only_fields = ['timestamp']

    def get_sensor_name(self, obj):
        return obj.sensor.name