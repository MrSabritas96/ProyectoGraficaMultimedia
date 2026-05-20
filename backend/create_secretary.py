import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser, Role

def run():
    role_sec = Role.objects.get(name='Secretario')
    user, created = CustomUser.objects.get_or_create(
        email='secretario@gmail.com',
        defaults={
            'codigo_unico': 'SEC-00001',
            'role': role_sec,
            'is_active': True
        }
    )
    user.set_password('Hospital123*')
    user.save()
    print(f"Secretario created: {user.email}")
    
    # Asegurar que el doctor tenga la pass correcta
    doc = CustomUser.objects.filter(email='fguzman@gmail.com').first()
    if doc:
        doc.set_password('Hospital123*')
        doc.is_active = True
        doc.save()
        print(f"Doctor updated: {doc.email}")

if __name__ == "__main__":
    run()
