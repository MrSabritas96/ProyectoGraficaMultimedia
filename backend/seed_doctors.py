import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser, Role

def seed_doctors():
    try:
        doctor_role = Role.objects.get(name="Doctor")
    except Role.DoesNotExist:
        doctor_role = Role.objects.create(name="Doctor")

    # Clear existing doctors to avoid duplicates if re-run
    CustomUser.objects.filter(role=doctor_role).delete()

    doctores_data = [
        {"first_name": "Fernando", "last_name": "Guzman", "email": "fguzman@hospital.com"},
        {"first_name": "Valeria", "last_name": "Rios", "email": "vrios@hospital.com"},
        {"first_name": "Carlos", "last_name": "Mendoza", "email": "cmendoza@hospital.com"},
        {"first_name": "Lucia", "last_name": "Fernandez", "email": "lfernandez@hospital.com"},
        {"first_name": "Roberto", "last_name": "Salas", "email": "rsalas@hospital.com"},
        {"first_name": "Elena", "last_name": "Vargas", "email": "evargas@hospital.com"},
        {"first_name": "Andres", "last_name": "Herrera", "email": "aherrera@hospital.com"},
        {"first_name": "Sofia", "last_name": "Paredes", "email": "sparedes@hospital.com"},
        {"first_name": "Miguel", "last_name": "Rojas", "email": "mrojas@hospital.com"},
        {"first_name": "Carmen", "last_name": "Ortiz", "email": "cortiz@hospital.com"},
    ]

    for i, data in enumerate(doctores_data):
        user = CustomUser(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=doctor_role,
            is_staff=False,
            is_superuser=False,
            codigo_unico=f"DOC-{uuid.uuid4().hex[:6].upper()}-{i}"
        )
        user.set_password('password123')
        user.save()
    
    print(f"Successfully seeded {len(doctores_data)} doctors.")

if __name__ == '__main__':
    seed_doctors()
