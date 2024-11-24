from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Achievement, User


class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'points', 'rank', 'reports_count']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm')
        extra_kwargs = {
            'username': {'required': True},
            'password': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class AchievementSerializer(serializers.ModelSerializer):
    earned_at = serializers.DateTimeField(read_only=True, required=False)

    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'points', 'icon', 'earned_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Check if earned_at exists before trying to access it
        if 'earned_at' in data and data['earned_at'] is not None:
            # Format the date if needed
            data['earned_at'] = instance.earned_at.strftime('%Y-%m-%d %H:%M:%S')
        return data