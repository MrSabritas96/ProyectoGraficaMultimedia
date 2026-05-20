import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser, Role

def run():
    for r in Role.objects.all():
        print(f"Role: '{r.name}'")
        user = CustomUser.objects.filter(role=r).first()
        if user:
            print(f"  Sample user: {user.email} ({user.codigo_unico})")
        else:
            print("  No users for this role")

if __name__ == "__main__":
    run()
