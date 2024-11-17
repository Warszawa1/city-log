from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import Sighting

@admin.register(Sighting)
class SightingAdmin(GISModelAdmin):
    list_display = ('user', 'created_at', 'verified_count')
    list_filter = ('created_at',)
