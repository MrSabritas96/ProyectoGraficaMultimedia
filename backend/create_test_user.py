import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser, Role

role = Role.objects.get(name='Administrador')
user, created = CustomUser.objects.get_or_create(
    email='admin@hospital.com',
    defaults={
        'codigo_unico': 'ADM001',
        'role': role,
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    user.set_password('password123')
    user.save()
    print("Test user created.")
else:
    print("Test user already exists.")
