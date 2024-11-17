from django.contrib.gis.db import models
from django.conf import settings

class Sighting(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    location = models.PointField()
    photo = models.ImageField(upload_to='sightings/', null=True, blank=True)
    description = models.TextField(blank=True)
    verified_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
