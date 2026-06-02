import os
import django
import random
import unicodedata
import re

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from infrastructure.models import CustomUser, MedicalEquipment, Role

def clean_text(t):
    if not t: return ""
    t = str(t).lower().strip()
    t = "".join(c for c in unicodedata.normalize('NFD', t) if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', t)

def run():
    print("=== INICIANDO ACTUALIZACIÓN DE USUARIOS A LA PAZ, BOLIVIA ===")

    # Pools de datos Paceños / Bolivianos
    nombres_masculinos = ['Carlos', 'Andrés', 'Marcelo', 'Juan', 'Diego', 'Miguel', 'Luis', 'Jorge', 'Fernando', 'Ricardo', 'Sergio', 'Mauricio', 'Javier', 'Hugo', 'René', 'Álvaro', 'Jaime', 'Walter']
    nombres_femeninos = ['Ana', 'María', 'Sofía', 'Lucía', 'Paula', 'Valeria', 'Daniela', 'Camila', 'Laura', 'Andrea', 'Mariana', 'Gabriela', 'Elena', 'Carmen', 'Beatriz', 'Raquel', 'Patricia', 'Sandra']
    apellidos = ['Quispe', 'Mamani', 'Choque', 'Condori', 'Flores', 'Vargas', 'Gutierrez', 'Rodriguez', 'Gomez', 'Lopez', 'Fernandez', 'Perez', 'Garcia', 'Martinez', 'Sanchez', 'Torres', 'Ramos', 'Romero', 'Herrera', 'Mendoza', 'Chavez', 'Limachi', 'Yujra', 'Ticona', 'Apaza', 'Tarqui', 'Cruz', 'Alanoca']
    
    universidades = ['UMSA (Universidad Mayor de San Andrés)', 'UPEA (Universidad Pública de El Alto)', 'UCB (Universidad Católica Boliviana)', 'EMI (Escuela Militar de Ingeniería)', 'UPB (Universidad Privada Boliviana)']
    hospitales = ['Hospital de Clínicas de La Paz', 'Hospital del Niño', 'Hospital de la Mujer', 'Hospital Obrero N° 1', 'Hospital Municipal Cotahuma', 'Hospital del Norte (El Alto)', 'Clínica Rengel', 'Clínica Cemes']

    users = CustomUser.objects.all()
    for user in users:
        role_name = user.role.name if user.role else 'Usuario'
        
        # 1. Nombres y Apellidos Bolivianos
        if not user.first_name or user.first_name == 'Admin' or user.first_name == 'Demo':
            if user.email == 'admin@gmail.com':
                user.first_name = 'Admin'
                user.last_name = 'Sistema'
            else:
                is_male = random.choice([True, False])
                user.first_name = random.choice(nombres_masculinos if is_male else nombres_femeninos)
                user.last_name = random.choice(apellidos)
                user.second_name = random.choice(nombres_masculinos if is_male else nombres_femeninos) if random.random() > 0.4 else ""
                user.maternal_last_name = random.choice(apellidos)

        # 2. Cédula de Identidad con sufijo LP
        if not user.ci or user.ci == 'No registrado' or user.ci == 'N/A' or 'LP' not in user.ci:
            user.ci = f"{random.randint(4500000, 12000000)} LP"

        # 3. Teléfono Celular Boliviano (8 dígitos que comienzan con 6 o 7)
        if not user.cellphone or len(user.cellphone) < 8:
            user.cellphone = f"{random.choice([6, 7])}{random.randint(1000000, 9999999)}"

        # 4. Matrículas correspondientes
        if not user.matricula or user.matricula == 'N/A':
            if role_name == 'Ingeniero Electrónico':
                user.matricula = f"SIB-{random.randint(10000, 59999)}"
            elif role_name == 'Doctor':
                user.matricula = f"COLD-LP-{random.randint(1000, 9999)}"
            elif role_name == 'Jefe de Unidad':
                user.matricula = f"SIB-{random.randint(10000, 19999)}"
            elif role_name == 'Secretario':
                user.matricula = f"SEC-{random.randint(100, 999)}"
            else:
                user.matricula = f"MAT-{random.randint(1000, 9999)}"

        # 5. Descripciones de Perfil realistas referenciando La Paz
        if not user.descripcion_perfil or len(user.descripcion_perfil) < 10:
            univ = random.choice(universidades)
            hosp = random.choice(hospitales)
            exp = random.randint(2, 18)
            if role_name == 'Ingeniero Electrónico':
                user.descripcion_perfil = f"Ingeniero Biomédico titulado de la {univ}. Con {exp} años de experiencia en mantenimiento de equipos de soporte vital en el {hosp}."
            elif role_name == 'Doctor':
                user.descripcion_perfil = f"Médico Especialista con formación en {univ} y más de {exp} años de servicio en el área clínica del {hosp}."
            elif role_name == 'Jefe de Unidad':
                user.descripcion_perfil = f"Jefe del Departamento de Ingeniería Clínica, titulado de la {univ} con especialidad en Gestión Hospitalaria Paceña."
            else:
                user.descripcion_perfil = f"Personal técnico administrativo del sistema MedTrack en La Paz, encargado del soporte y control de inventario."

        user.save()
        print(f"-> Actualizado usuario: {user.email} | CI: {user.ci} | Tel: {user.cellphone} | Mat: {user.matricula} ({role_name})")

    print("\n=== INICIANDO VINCULACIÓN AUTOMÁTICA DE IMÁGENES DE EQUIPOS ===")
    
    media_root = settings.MEDIA_ROOT
    equipments_dir = os.path.join(media_root, 'equipments')
    
    # Crear la carpeta si no existe para que el usuario pueda poner sus imágenes
    if not os.path.exists(equipments_dir):
        os.makedirs(equipments_dir)
        print(f"Creado directorio de imágenes en: {equipments_dir}")
        print("Por favor, coloca tus imágenes en esta carpeta y vuelve a ejecutar el script.")
        return

    # Listar archivos de la carpeta
    files = [f for f in os.listdir(equipments_dir) if os.path.isfile(os.path.join(equipments_dir, f))]
    if not files:
        print(f"No se encontraron archivos de imágenes en: {equipments_dir}")
        print("Por favor, copia tus imágenes allí (p. ej., 'Resonador.png') y vuelve a ejecutar el script.")
        return

    print(f"Archivos de imágenes detectados: {files}")

    equipments = MedicalEquipment.objects.all()
    linked_count = 0
    for eq in equipments:
        eq_name_clean = clean_text(eq.nombre)
        eq_code_clean = clean_text(eq.codigo_interno)
        
        matched_file = None
        for filename in files:
            file_name_without_ext = os.path.splitext(filename)[0]
            file_clean = clean_text(file_name_without_ext)
            
            # Comparaciones de correspondencia
            if file_clean and (file_clean in eq_name_clean or eq_name_clean in file_clean or file_clean in eq_code_clean):
                matched_file = filename
                break

        if matched_file:
            relative_path = f"equipments/{matched_file}"
            eq.foto = relative_path
            eq.save()
            linked_count += 1
            print(f"[VINCULADO] Equipo: {eq.nombre} ({eq.codigo_interno}) -> {relative_path}")
        else:
            # Mantener sin foto (null) para que use el fallback de Unsplash
            eq.foto = None
            eq.save()
            print(f"[SIN VINCULO] Equipo: {eq.nombre} (No se encontró coincidencia en {files})")

    print(f"Vinculación finalizada. Se enlazaron {linked_count} de {equipments.count()} equipos médicos.")

if __name__ == '__main__':
    run()
