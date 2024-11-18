# Generated by Django 5.1.3 on 2024-11-18 15:11

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_email'),
    ]

    operations = [
        migrations.CreateModel(
            name='Achievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('points', models.IntegerField(default=0)),
                ('icon', models.CharField(max_length=50)),
            ],
        ),
        migrations.AddField(
            model_name='user',
            name='reports_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='user',
            name='rank',
            field=models.CharField(choices=[('NOVICE', 'Rat Spotter'), ('SCOUT', 'Rat Scout'), ('HUNTER', 'Rat Hunter'), ('MASTER', 'Rat Master')], default='NOVICE', max_length=50),
        ),
        migrations.CreateModel(
            name='UserAchievement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('earned_at', models.DateTimeField(auto_now_add=True)),
                ('achievement', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.achievement')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='achievements', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
