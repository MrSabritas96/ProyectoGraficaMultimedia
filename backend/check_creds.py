import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser

def run():
    emails = ['admin@gmail.com', 'jefe@gmail.com', 'ingeniero@gmail.com']
    for e in emails:
        user = CustomUser.objects.filter(email=e).first()
        if user:
            print(f"User: {e}")
            print(f"  Codigo: {user.codigo_unico}")
            print(f"  Password Check 'Hospital123*': {user.check_password('Hospital123*')}")
            print(f"  Password Check 'demo1234': {user.check_password('demo1234')}")
            print(f"  Is Active: {user.is_active}")
        else:
            print(f"User {e} not found")

if __name__ == "__main__":
    run()
