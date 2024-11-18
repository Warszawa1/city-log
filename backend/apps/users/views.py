from rest_framework import viewsets, generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import  RegisterSerializer
import logging
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Achievement
from .serializers import AchievementSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by('-points')[:10]  # Top 10 users
    serializer_class = RegisterSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)


logger = logging.getLogger(__name__)

class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        logger.info(f"Login attempt for user: {request.data.get('username')}")
        response = super().post(request, *args, **kwargs)
        logger.info(f"Login response status: {response.status_code}")
        return response


class UserAchievementsView(generics.ListAPIView):
    serializer_class = AchievementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Get all achievements and mark which ones the user has earned
        achievements = Achievement.objects.all()
        user_achievements = self.request.user.achievements.values_list(
            'achievement_id', 'earned_at'
        )
        earned_dict = dict(user_achievements)
        
        for achievement in achievements:
            achievement.earned_at = earned_dict.get(achievement.id)
        
        return achievements