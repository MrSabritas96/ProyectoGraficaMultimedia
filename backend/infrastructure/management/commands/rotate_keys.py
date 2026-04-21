import secrets
import os
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Rota la SECRET_KEY y claves de seguridad del sistema'

    def handle(self, *args, **options):
        env_path = os.path.join(settings.BASE_DIR, '.env')
        if not os.path.exists(env_path):
            self.stdout.write(self.style.ERROR(".env no encontrado"))
            return

        new_secret = secrets.token_urlsafe(50)
        new_jwt_secret = secrets.token_urlsafe(50)

        with open(env_path, 'r') as f:
            lines = f.readlines()

        new_lines = []
        for line in lines:
            if line.startswith('SECRET_KEY='):
                new_lines.append(f"SECRET_KEY={new_secret}\n")
            elif line.startswith('JWT_SECRET_KEY='):
                new_lines.append(f"JWT_SECRET_KEY={new_jwt_secret}\n")
            else:
                new_lines.append(line)

        with open(env_path, 'w') as f:
            f.writelines(new_lines)

        self.stdout.write(self.style.SUCCESS("Claves rotadas exitosamente en .env"))
        self.stdout.write(self.style.WARNING("Reinicie el servidor para aplicar los cambios."))
