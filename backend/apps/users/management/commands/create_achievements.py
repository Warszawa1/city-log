from django.core.management.base import BaseCommand
from users.models import Achievement

class Command(BaseCommand):
    help = 'Creates initial achievements'

    def handle(self, *args, **options):
        achievements = [
            {
                'name': 'First Sighting',
                'description': 'Report your first rat sighting',
                'points': 10,
                'icon': '🐀'
            },
            {
                'name': 'Early Bird',
                'description': 'Report a rat before 7 AM',
                'points': 20,
                'icon': '🌅'
            },
            {
                'name': 'Night Owl',
                'description': 'Report a rat after 10 PM',
                'points': 20,
                'icon': '🦉'
            },
            {
                'name': 'Streak Hunter',
                'description': 'Report rats 3 days in a row',
                'points': 50,
                'icon': '🔥'
            },
            {
                'name': 'Area Expert',
                'description': 'Report 5 rats in the same neighborhood',
                'points': 100,
                'icon': '🏆'
            }
        ]
        
        for achievement in achievements:
            obj, created = Achievement.objects.get_or_create(
                name=achievement['name'],
                defaults={
                    'description': achievement['description'],
                    'points': achievement['points'],
                    'icon': achievement['icon']
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created achievement: {achievement["name"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Achievement already exists: {achievement["name"]}')
                )
