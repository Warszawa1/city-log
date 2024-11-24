"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenVerifyView
from backend.apps.sightings.views import SightingViewSet
from backend.apps.users.views import UserViewSet, RegisterView, LoginView
from django.http import JsonResponse
from backend.apps.users.views import UserAchievementsView
from backend.apps.users.views import UserMeView



router = DefaultRouter()
router.register(r'sightings', SightingViewSet)


def test_api(request):
    return JsonResponse({"message": "API is working"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/', test_api, name='test-api'),
    path('api/auth/register/', RegisterView.as_view()),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/auth/verify/', TokenVerifyView.as_view(), name='verify'),
    path('api/auth/refresh/', TokenRefreshView.as_view()),
    path('api/users/achievements/', UserAchievementsView.as_view()),
    path('api/leaderboard/', UserViewSet.as_view({'get': 'list'}), name='leaderboard'),
    path('api/', include(router.urls)),
    path('api/users/me/', UserMeView.as_view(), name='user-me'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
