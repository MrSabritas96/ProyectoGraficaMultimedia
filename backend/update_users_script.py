import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser

def update_users():
    users = CustomUser.objects.all()
    for user in users:
        if '@hospital.com' in user.email:
            new_email = user.email.replace('@hospital.com', '@gmail.com')
            user.email = new_email
            if user.role and user.role.name == 'Jefe de Unidad' and user.codigo_unico.startswith('GEF'):
                user.codigo_unico = user.codigo_unico.replace('GEF', 'JEF')
            
            try:
                user.save()
                print(f"Updated user to: {user.email} - Code: {user.codigo_unico}")
            except Exception as e:
                print(f"Error updating user {user.email}: {e}")

if __name__ == '__main__':
    update_users()
