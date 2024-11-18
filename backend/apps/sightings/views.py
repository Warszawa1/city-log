from rest_framework import viewsets, permissions 
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from .models import Sighting
from .serializers import SightingSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.db.models import Count
from django.contrib.gis.db.models.functions import SnapToGrid
from .serializers import SightingSerializer
from django.utils import timezone
from django.db.models import Count
from ..users.models import Achievement, UserAchievement


class SightingViewSet(viewsets.ModelViewSet):
    queryset = Sighting.objects.all()
    serializer_class = SightingSerializer
    permission_classes = [permissions.IsAuthenticated] 

    @action(detail=False, methods=['GET'])
    def my(self, request):
        queryset = self.get_queryset().filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['GET'])
    def stats(self, request):
        total_reports = Sighting.objects.count()
        user_reports = Sighting.objects.filter(user=request.user).count()

        # Get top areas using PostGIS
        top_areas = (
            Sighting.objects
            .annotate(area=SnapToGrid('location', 0.01))
            .values('area')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        return Response({
            'totalReports': total_reports,
            'userReports': user_reports,
            'topAreas': [
                {
                    'area': f"{area['area'].coords[0]:.4f}, {area['area'].coords[1]:.4f}",
                    'count': area['count']
                }
                for area in top_areas
            ]
        })
    

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
        
        # Update user stats
        user.reports_count += 1
        user.points += 10  # Base points for reporting
        user.save()
        
        # Check achievements
        self.check_achievements(user, sighting)
        
        return sighting
    
    def check_achievements(self, user, sighting):
        # First sighting achievement
        if user.reports_count == 1:
            achievement = Achievement.objects.get(name='First Sighting')
            UserAchievement.objects.create(user=user, achievement=achievement)
            user.points += achievement.points
        
        # Time-based achievements
        hour = timezone.localtime(sighting.created_at).hour
        if hour < 7:
            achievement = Achievement.objects.get(name='Early Bird')
            UserAchievement.objects.get_or_create(user=user, achievement=achievement)
            user.points += achievement.points
        elif hour >= 22:
            achievement = Achievement.objects.get(name='Night Owl')
            UserAchievement.objects.get_or_create(user=user, achievement=achievement)
            user.points += achievement.points
        
        # Update user rank based on points
        user.update_rank()
        user.save()
