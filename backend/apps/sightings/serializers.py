from rest_framework import serializers
from django.contrib.gis.geos import Point
from .models import Sighting
import logging

class SightingSerializer(serializers.ModelSerializer):
    longitude = serializers.FloatField(write_only=True)
    latitude = serializers.FloatField(write_only=True)
    location = serializers.SerializerMethodField()

    class Meta:
        model = Sighting
        fields = ('id', 'longitude', 'latitude', 'location', 'description', 'created_at')
        read_only_fields = ('location', 'created_at')

    def get_location(self, obj):
        if obj.location:
            return {
                'type': 'Point',
                'coordinates': [obj.location.x, obj.location.y]
            }
        return None

    def create(self, validated_data):
        longitude = float(validated_data.pop('longitude'))
        latitude = float(validated_data.pop('latitude'))
        point = Point(longitude, latitude, srid=4326)
        
        sighting = Sighting.objects.create(
            location=point,
            **validated_data  # user will be added in the view
        )
        return sighting
