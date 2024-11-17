from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    RANKS = [
        ('NOVICE', 'Novice'),
        ('SCOUT', 'Scout'),
        ('HUNTER', 'Hunter'),
        ('MASTER', 'Master')
    ]
    points = models.IntegerField(default=0)
    rank = models.CharField(max_length=50, choices=RANKS, default='NOVICE')

    # Remove email requirement
    REQUIRED_FIELDS = []