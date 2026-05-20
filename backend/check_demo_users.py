import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser

def setup_demo_users():
    roles = ['Secretario', 'Doctor']
    for r in roles:
        user = CustomUser.objects.filter(role__name=r).first()
        if user:
            user.set_password('Hospital123*')
            user.is_active = True
            user.save()
            print(f"Role: {r} -> {user.email} ({user.codigo_unico})")
        else:
            print(f"No user found for role: {r}")

if __name__ == "__main__":
    setup_demo_users()
