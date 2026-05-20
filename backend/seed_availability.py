import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser, EngineerAvailability

def run():
    ing = CustomUser.objects.filter(email='ingeniero@gmail.com').first()
    if ing:
        av, created = EngineerAvailability.objects.get_or_create(ingeniero=ing)
        av.estado = 'Disponible'
        av.save()
        print("EngineerAvailability seeded for", ing.email)
    else:
        print("Engineer not found")

if __name__ == "__main__":
    run()
