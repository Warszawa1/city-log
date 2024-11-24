from rest_framework import viewsets, generics, permissions
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .models import User, Achievement, UserAchievement
from .serializers import RegisterSerializer, AchievementSerializer, LeaderboardSerializer
import logging

logger = logging.getLogger(__name__)

class UserMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'points': user.points,
            'rank': user.rank,
            'reports_count': user.reports_count
        })

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for displaying leaderboard (top 10 users)
    """
    queryset = User.objects.order_by('-points')[:10]
    serializer_class = LeaderboardSerializer  # Changed from RegisterSerializer
    permission_classes = [IsAuthenticated]  # Add this if not already present

    def get_queryset(self):
        # Ensure we're getting fresh data
        return User.objects.order_by('-points')[:10]

class RegisterView(generics.CreateAPIView):
    """
    View for user registration
    """
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

class LoginView(TokenObtainPairView):
    """
    Custom login view with logging
    """
    permission_classes = (permissions.AllowAny,)

    def post(self, request, *args, **kwargs):
        logger.info(f"Login attempt for user: {request.data.get('username')}")
        try:
            response = super().post(request, *args, **kwargs)
            logger.info(f"Login response status: {response.status_code}")
            
            # If login successful, include user data in response
            if response.status_code == 200:
                user = User.objects.get(username=request.data.get('username'))
                response.data.update({
                    'user': {
                        'username': user.username,
                        'points': user.points,
                        'rank': user.rank,
                        'reports_count': user.reports_count
                    }
                })
            return response
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            raise

class UserAchievementsView(generics.ListAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get all achievements
        achievements = Achievement.objects.all()
        
        # Get user's earned achievements
        user_achievements = UserAchievement.objects.filter(
            user=self.request.user
        ).select_related('achievement')
        
        # Create a dictionary of earned achievements
        earned_dict = {
            ua.achievement_id: ua.earned_at 
            for ua in user_achievements
        }
        
        # Set earned_at for each achievement
        for achievement in achievements:
            achievement.earned_at = earned_dict.get(achievement.id)
        
        return achievements

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        # Add user stats to response
        response_data = {
            'achievements': serializer.data,
            'user_stats': {
                'points': request.user.points,
                'rank': request.user.rank,
                'reports_count': request.user.reports_count,
                'achievements_earned': len([
                    a for a in queryset if getattr(a, 'earned_at', None) is not None
                ])
            }
        }
        
        return Response(response_data)
    
