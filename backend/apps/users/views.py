from rest_framework import viewsets, generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import  RegisterSerializer

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.order_by('-points')[:10]  # Top 10 users
    serializer_class = RegisterSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

class LoginView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
