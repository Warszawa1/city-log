from rest_framework import viewsets, permissions 
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models import Count
from django.contrib.gis.db.models.functions import SnapToGrid
from django.utils import timezone
from django.db.models import Count, F
from datetime import timedelta
from .models import Sighting
from .serializers import SightingSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from ..users.models import Achievement, UserAchievement
from ..users.serializers import AchievementSerializer

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
        try:
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

            # Format the response data
            top_areas_data = []
            for area in top_areas:
                if area['area'] and area['area'].coords:
                    top_areas_data.append({
                        'area': f"{area['area'].coords[0]:.4f}, {area['area'].coords[1]:.4f}",
                        'count': area['count']
                    })

            return Response({
                'totalReports': total_reports,
                'userReports': user_reports,
                'topAreas': top_areas_data
            })
        except Exception as e:
            print(f"Error in stats endpoint: {str(e)}")  # For debugging
            return Response({
                'totalReports': 0,
                'userReports': 0,
                'topAreas': []
            })

    def get_queryset(self):
        queryset = Sighting.objects.all()
        print("Total sightings in DB:", queryset.count())
        
        lat = self.request.query_params.get('latitude')
        lng = self.request.query_params.get('longitude')
        if lat and lng:
            user_location = Point(float(lng), float(lat))
            queryset = queryset.filter(
                location__distance_lte=(user_location, D(km=5))
            )
        
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        sighting = serializer.save(user=self.request.user)
        
        # Update user stats
        user = self.request.user
        user.reports_count = F('reports_count') + 1
        user.points = F('points') + 10  # Base points for reporting
        user.save()
        
        # Refresh user to get updated values
        user.refresh_from_db()
        
        # Check achievements and get newly earned ones
        earned_achievements = self.check_achievements(user, sighting)
        
        # Prepare response with earned achievements if any
        response_data = serializer.data
        if earned_achievements:
            response_data['achievements_earned'] = AchievementSerializer(
                earned_achievements,
                many=True,
                context={'request': self.request}
            ).data
            response_data['points_earned'] = sum(a.points for a in earned_achievements) + 10
            
        return response_data
    
    def check_achievements(self, user, sighting):
        earned_achievements = []
        
        try:
            # First sighting achievement
            if user.reports_count == 1:
                achievement = Achievement.objects.get(name='First Sighting')
                _, created = UserAchievement.objects.get_or_create(
                    user=user, achievement=achievement)
                if created:
                    earned_achievements.append(achievement)
                    user.points += achievement.points
            
            # Time-based achievements
            current_time = timezone.localtime(sighting.created_at)
            hour = current_time.hour
            
            if hour < 7:
                achievement = Achievement.objects.get(name='Early Bird')
                _, created = UserAchievement.objects.get_or_create(
                    user=user, achievement=achievement)
                if created:
                    earned_achievements.append(achievement)
                    user.points += achievement.points
                    
            elif hour >= 22:
                achievement = Achievement.objects.get(name='Night Owl')
                _, created = UserAchievement.objects.get_or_create(
                    user=user, achievement=achievement)
                if created:
                    earned_achievements.append(achievement)
                    user.points += achievement.points
            
            # Milestone achievements
            if user.reports_count == 5:
                achievement = Achievement.objects.get(name='Active Reporter')
                _, created = UserAchievement.objects.get_or_create(
                    user=user, achievement=achievement)
                if created:
                    earned_achievements.append(achievement)
                    user.points += achievement.points
            
            # Weekly achievements
            week_ago = timezone.now() - timedelta(days=7)
            week_reports = Sighting.objects.filter(
                user=user,
                created_at__gte=week_ago
            ).count()
            
            if week_reports >= 7:
                achievement = Achievement.objects.get(name='Weekly Warrior')
                _, created = UserAchievement.objects.get_or_create(
                    user=user, achievement=achievement)
                if created:
                    earned_achievements.append(achievement)
                    user.points += achievement.points
            
            # Update user rank if achievements were earned
            if earned_achievements:
                user.update_rank()
                user.save()
            
        except Achievement.DoesNotExist as e:
            print(f"Achievement not found: {e}")
        except Exception as e:
            print(f"Error checking achievements: {e}")
        
        return earned_achievements