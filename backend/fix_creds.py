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
            user.set_password('Hospital123*')
            user.is_active = True
            user.save()
            print(f"Fixed {e}")
        else:
            print(f"User {e} not found")

if __name__ == "__main__":
    run()
