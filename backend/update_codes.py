import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser

def run():
    users = CustomUser.objects.all()
    count = 0
    for user in users:
        prefix = "USR"
        if user.role:
            role_map = {
                'Administrador': 'ADM',
                'Jefe de Unidad': 'JEF',
                'Secretario': 'SEC',
                'Ingeniero Electronico': 'ING',
                'Doctor': 'DOC'
            }
            prefix = role_map.get(user.role.name, "USR")
        
        base_code = user.matricula if user.matricula else str(user.id).zfill(5)
        new_code = f"{prefix}-{base_code}"
        
        # Make sure it doesn't collide
        if CustomUser.objects.filter(codigo_unico=new_code).exclude(id=user.id).exists():
            new_code = f"{prefix}-{base_code}-{user.id}"
            
        user.codigo_unico = new_code
        user.save()
        count += 1
        print(f"Updated {user.email} to {new_code}")
    
    print(f"Total updated: {count}")

if __name__ == "__main__":
    run()
