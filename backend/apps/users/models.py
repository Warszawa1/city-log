from django.contrib.auth.models import AbstractUser
from django.db import models

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

class Achievement(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    points = models.IntegerField(default=0)
    icon = models.CharField(max_length=50)  # Emoji or icon class

class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    # Remove email requirement
    REQUIRED_FIELDS = []