from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    RANKS = [
        ('NOVICE', 'Rat Spotter'),
        ('SCOUT', 'Rat Scout'),
        ('HUNTER', 'Rat Hunter'),
        ('MASTER', 'Rat Master')
    ]
    
    points = models.IntegerField(default=0)
    rank = models.CharField(max_length=50, choices=RANKS, default='NOVICE')
    reports_count = models.IntegerField(default=0)
    
    def update_rank(self):
        if self.points >= 1000:
            self.rank = 'MASTER'
        elif self.points >= 500:
            self.rank = 'HUNTER'
        elif self.points >= 100:
            self.rank = 'SCOUT'
        self.save()
    
    def check_achievements(self):
        """Check and award any newly earned achievements"""
        earned_achievements = []
        
        # First Sighting Achievement
        if self.reports_count == 1:
            achievement = Achievement.objects.get(name='First Sighting')
            _, created = UserAchievement.objects.get_or_create(
                user=self,
                achievement=achievement
            )
            if created:
                earned_achievements.append(achievement)
                self.points += achievement.points
        
        # Active Reporter Achievement (5 reports)
        if self.reports_count >= 5:
            achievement = Achievement.objects.filter(name='Active Reporter').first()
            if achievement:
                _, created = UserAchievement.objects.get_or_create(
                    user=self,
                    achievement=achievement
                )
                if created:
                    earned_achievements.append(achievement)
                    self.points += achievement.points
        
        # Night Watcher Achievement
        night_reports = self.sightings.filter(
            created_at__hour__gte=22) | self.sightings.filter(
            created_at__hour__lte=5
        ).count()
        
        if night_reports >= 3:
            achievement = Achievement.objects.filter(name='Night Watcher').first()
            if achievement:
                _, created = UserAchievement.objects.get_or_create(
                    user=self,
                    achievement=achievement
                )
                if created:
                    earned_achievements.append(achievement)
                    self.points += achievement.points
        
        # Weekly Warrior Achievement
        seven_days_ago = timezone.now() - timedelta(days=7)
        if self.sightings.filter(created_at__gte=seven_days_ago).count() >= 7:
            achievement = Achievement.objects.filter(name='Weekly Warrior').first()
            if achievement:
                _, created = UserAchievement.objects.get_or_create(
                    user=self,
                    achievement=achievement
                )
                if created:
                    earned_achievements.append(achievement)
                    self.points += achievement.points
        
        if earned_achievements:
            self.update_rank()
            self.save()
        
        return earned_achievements

class Achievement(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    points = models.IntegerField(default=0)
    icon = models.CharField(max_length=50)  # Emoji or icon class

    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement')

    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"