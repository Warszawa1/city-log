from rest_framework import viewsets, permissions 
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from .models import Sighting
from .serializers import SightingSerializer

class SightingViewSet(viewsets.ModelViewSet):
    queryset = Sighting.objects.all()
    serializer_class = SightingSerializer
    permission_classes = [permissions.IsAuthenticated]  # Changed this

    def get_queryset(self):
        queryset = Sighting.objects.all()
        print("Total sightings in DB:", queryset.count())  # Debug print
        
        lat = self.request.query_params.get('latitude')
        lng = self.request.query_params.get('longitude')
        if lat and lng:
            user_location = Point(float(lng), float(lat))
            queryset = queryset.filter(
                location__distance_lte=(user_location, D(km=5))
            )
        
        result = queryset.order_by('-created_at')
        print("Returning sightings:", list(result.values()))  # Debug print
        return result

    def perform_create(self, serializer):
        sighting = serializer.save(user=self.request.user)
        # Update user points
        user = self.request.user
        user.points += 10
        if 'photo' in self.request.FILES:
            user.points += 5

        # Update rank based on points
        if user.points >= 100:
            user.rank = 'MASTER'
        elif user.points >= 50:
            user.rank = 'HUNTER'
        elif user.points >= 20:
            user.rank = 'SCOUT'

        user.save()
        return sighting
