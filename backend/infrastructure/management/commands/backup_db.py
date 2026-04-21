import os
import subprocess
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Genera un respaldo de la base de datos PostgreSQL'

    def handle(self, *args, **options):
        db_settings = settings.DATABASES['default']
        db_name = db_settings['NAME']
        db_user = db_settings['USER']
        db_pass = db_settings['PASSWORD']
        db_host = db_settings['HOST']
        db_port = db_settings['PORT']

        # Crear carpeta de backups si no existe
        backup_dir = os.path.join(settings.BASE_DIR, 'backups')
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"backup_{db_name}_{timestamp}.sql"
        filepath = os.path.join(backup_dir, filename)

        # Configurar variable de entorno para la contraseña (evita prompt interactivo)
        env = os.environ.copy()
        env['PGPASSWORD'] = db_pass

        try:
            self.stdout.write(self.style.NOTICE(f"Iniciando respaldo de {db_name}..."))
            
            # Comando pg_dump
            command = [
                'pg_dump',
                '-h', db_host,
                '-p', str(db_port),
                '-U', db_user,
                '-f', filepath,
                db_name
            ]

            subprocess.run(command, env=env, check=True)
            
            self.stdout.write(self.style.SUCCESS(f"Respaldo completado exitosamente: {filepath}"))
            
            # Limpieza lógica (opcional: borrar backups antiguos de más de 7 días)
            self.cleanup_old_backups(backup_dir)

        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR(f"Error al ejecutar pg_dump: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error inesperado: {str(e)}"))

    def cleanup_old_backups(self, backup_dir):
        import time
        now = time.time()
        for f in os.listdir(backup_dir):
            f_path = os.path.join(backup_dir, f)
            if os.stat(f_path).st_mtime < now - (7 * 86400): # 7 días
                if os.path.isfile(f_path):
                    os.remove(f_path)
                    self.stdout.write(self.style.WARNING(f"Eliminado respaldo antiguo: {f}"))
