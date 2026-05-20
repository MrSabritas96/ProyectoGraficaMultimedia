import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import Role, CustomUser

try:
    target_role = Role.objects.get(name="Ingeniero Electronico")
except Role.DoesNotExist:
    print("Role not found, creating it")
    target_role = Role.objects.create(name="Ingeniero Electronico")

for u in CustomUser.objects.all():
    if "Ingeniero" in u.role.name and u.role.name != "Ingeniero Electronico":
        u.role = target_role
        u.save()
        print(f"Updated {u.email}")
