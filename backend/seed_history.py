import os
import django
import random
import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.models import MedicalEquipment

equipments = list(MedicalEquipment.objects.all()[:15])

# Realistic sample positions in a typical 1x1x1 bounding box
positions = [
    [0.2, 0.5, 0.3],
    [-0.3, 0.8, 0.1],
    [0.0, 0.2, -0.4],
    [0.4, 0.1, 0.5],
    [-0.2, 0.6, -0.2]
]

acciones = [
    "Reemplazo de condensador quemado en la placa principal.",
    "Limpieza profunda y lubricación de engranajes móviles.",
    "Ajuste de calibración de sensor de proximidad.",
    "Cambio de pantalla LCD por píxeles muertos.",
    "Reconexión de cable de alimentación interno suelto."
]

for i, eq in enumerate(equipments):
    if i % 3 == 0:
        num_mants = 2
    elif i % 2 == 0:
        num_mants = 1
    else:
        num_mants = 0
        
    mants = []
    for j in range(num_mants):
        pos = random.choice(positions)
        accion = random.choice(acciones)
        date = (datetime.date.today() - datetime.timedelta(days=random.randint(5, 60))).strftime('%d %b %Y')
        
        mants.append({
            "id": random.randint(1000, 9999),
            "position3D": pos,
            "title": "Mantenimiento Correctivo Prev.",
            "status": "fixed",
            "details": {
                "fecha_resolucion": date,
                "aprobado_por": "Ing. Residente",
                "accion_tomada": accion
            }
        })
    
    eq.mantenimientos_previos = mants
    eq.save()

print(f"Se inyectaron mantenimientos previos en {len(equipments)} equipos de prueba.")
