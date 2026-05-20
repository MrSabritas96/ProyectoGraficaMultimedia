import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import CustomUser, Role

# Make sure roles exist
roles = ['Jefe de Unidad', 'Ingeniero Electrónico', 'Administrador', 'Secretario', 'Doctor']
for r in roles:
    Role.objects.get_or_create(name=r)

nombres_masculinos = ['Carlos', 'Andrés', 'Marcelo', 'Juan', 'Diego', 'Miguel', 'Luis', 'Jorge', 'Fernando', 'Ricardo', 'Sergio', 'Mauricio', 'Javier']
nombres_femeninos = ['Ana', 'Maria', 'Sofia', 'Lucia', 'Paula', 'Valeria', 'Daniela', 'Camila', 'Laura', 'Andrea', 'Mariana', 'Gabriela']
apellidos = ['Quispe', 'Mamani', 'Choque', 'Condori', 'Flores', 'Vargas', 'Gutierrez', 'Rodriguez', 'Gomez', 'Lopez', 'Fernandez', 'Perez', 'Garcia', 'Martinez', 'Sanchez', 'Torres', 'Ramos', 'Romero', 'Herrera', 'Mendoza', 'Chavez']

especialidades_pool = [
    {"nombre": "Equipos de Imagenología", "descripcion": "Especialista en mantenimiento y calibración de Tomógrafos y Resonancia Magnética. Certificación Phillips nivel 3."},
    {"nombre": "Soporte Vital", "descripcion": "Experiencia en ventiladores mecánicos, monitores multiparamétricos y desfibriladores. Entrenado en emergencias."},
    {"nombre": "Electrónica Médica", "descripcion": "Reparación de placas de circuito impreso y componentes electrónicos de baja escala en equipos biomédicos."},
    {"nombre": "Equipos Quirúrgicos", "descripcion": "Mantenimiento preventivo de mesas quirúrgicas, lámparas cialíticas y máquinas de anestesia."},
    {"nombre": "Laboratorio Clínico", "descripcion": "Calibración y reparación de centrífugas, analizadores de gases y espectrofotómetros."},
    {"nombre": "Sistemas Neumáticos", "descripcion": "Mantenimiento de redes de gases medicinales y bombas de vacío."}
]

def generate_random_date(start_year, end_year):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return start + timedelta(seconds=random.randint(0, int((end - start).total_seconds())))

def generate_engineer_data(index):
    is_male = random.choice([True, False])
    first_name = random.choice(nombres_masculinos if is_male else nombres_femeninos)
    second_name = random.choice(nombres_masculinos if is_male else nombres_femeninos) if random.random() > 0.3 else ""
    last_name = random.choice(apellidos)
    maternal_last_name = random.choice(apellidos)

    email = f"{first_name.lower()}{last_name.lower()}{index}@gmail.com"
    ci = f"{random.randint(4000000, 15000000)} LP"
    matricula = f"SIB-{random.randint(10000, 99999)}"
    cellphone = f"{random.randint(60000000, 79999999)}"
    
    num_especialidades = random.randint(1, 3)
    especialidades = random.sample(especialidades_pool, num_especialidades)

    birth_date = generate_random_date(1975, 1998).date()
    
    # Univ
    univ = random.choice(["UMSA", "UPEA", "UCB", "EMI"])
    descripcion = f"Ingeniero Biomédico titulado de la {univ}. Con más de {random.randint(2, 15)} años de experiencia en el área hospitalaria."

    return {
        'email': email,
        'codigo_unico': f'ING-{index:03d}',
        'role_name': 'Ingeniero Electrónico',
        'password': 'demo1234',
        'first_name': first_name,
        'second_name': second_name,
        'last_name': last_name,
        'maternal_last_name': maternal_last_name,
        'ci': ci,
        'matricula': matricula,
        'birth_date': birth_date,
        'cellphone': cellphone,
        'especialidades': especialidades,
        'descripcion_perfil': descripcion
    }

users_data = [
    {
        'email': 'jefe@gmail.com', 'codigo_unico': 'JEF-001', 'role_name': 'Jefe de Unidad', 'password': 'demo1234',
        'first_name': 'Carlos', 'last_name': 'Vargas', 'ci': '5432123 LP', 'matricula': 'SIB-10023',
        'cellphone': '76543210', 'especialidades': [{"nombre": "Gestión Hospitalaria", "descripcion": "Administración de recursos médicos y personal."}],
        'descripcion_perfil': 'Jefe de la Unidad de Ingeniería Clínica con amplia experiencia en gestión hospitalaria.',
        'birth_date': '1980-05-15'
    },
    {
        'email': 'admin@gmail.com', 'codigo_unico': 'ADM-001', 'role_name': 'Administrador', 'password': 'demo1234',
        'first_name': 'Admin', 'last_name': 'Sistema', 'ci': '1234567 LP', 'matricula': '',
        'cellphone': '70000000', 'especialidades': [],
        'descripcion_perfil': 'Administrador del sistema.',
        'birth_date': '1990-01-01'
    },
    {
        'email': 'ingeniero@gmail.com', 'codigo_unico': 'ING-001', 'role_name': 'Ingeniero Electrónico', 'password': 'demo1234',
        'first_name': 'Miguel', 'last_name': 'Choque', 'ci': '7654321 LP', 'matricula': 'SIB-54321',
        'cellphone': '71111111', 'especialidades': [{"nombre": "Soporte Vital", "descripcion": "Especialista en equipos de soporte vital y ventiladores."}],
        'descripcion_perfil': 'Ingeniero Electrónico y Biomédico especializado en UCI.',
        'birth_date': '1985-08-22'
    }
]

for i in range(2, 26):
    users_data.append(generate_engineer_data(i))

for data in users_data:
    try:
        role = Role.objects.get(name=data['role_name'])
        
        # Prepare defaults excluding special fields
        defaults = {
            'codigo_unico': data['codigo_unico'],
            'role': role,
            'is_staff': data['role_name'] == 'Administrador',
            'is_superuser': data['role_name'] == 'Administrador',
            'first_name': data.get('first_name', ''),
            'second_name': data.get('second_name', ''),
            'last_name': data.get('last_name', ''),
            'maternal_last_name': data.get('maternal_last_name', ''),
            'ci': data.get('ci', ''),
            'matricula': data.get('matricula', ''),
            'cellphone': data.get('cellphone', ''),
            'especialidades': data.get('especialidades', []),
            'descripcion_perfil': data.get('descripcion_perfil', ''),
            'photo': 'profiles/default.png'
        }
        
        if 'birth_date' in data and data['birth_date']:
            defaults['birth_date'] = data['birth_date']
            
        user, created = CustomUser.objects.update_or_create(
            email=data['email'],
            defaults=defaults
        )
        user.set_password(data['password'])
        user.save()
        status = "Created" if created else "Updated"
        print(f"{status} user {data['email']} with code {data['codigo_unico']}.")
    except Exception as e:
        print(f"Error creating user {data['email']}: {e}")

print("Seeding completed successfully!")
