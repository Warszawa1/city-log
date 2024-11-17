from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
   list_display = ('username', 'points', 'rank')
   list_filter = ('rank',)
   fieldsets = (
       (None, {'fields': ('username', 'password')}),
       ('Progress', {'fields': ('points', 'rank')}),
       ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
   )
