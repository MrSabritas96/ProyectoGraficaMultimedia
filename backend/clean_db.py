import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_system.settings')
django.setup()

from infrastructure.models import IncidentReport, WorkOrder, Notification, MedicalEquipment

# Borrar todas las notificaciones
Notification.objects.all().delete()
print("Notificaciones eliminadas.")

# Borrar todas las ordenes de trabajo
WorkOrder.objects.all().delete()
print("Órdenes de trabajo eliminadas.")

# Borrar todos los reportes de incidentes
IncidentReport.objects.all().delete()
print("Incidentes eliminados.")

# Resetear estado de falla en equipos
for eq in MedicalEquipment.objects.all():
    eq.falla_activa = False
    eq.falla_coordenada_x = None
    eq.falla_coordenada_y = None
    eq.falla_coordenada_z = None
    eq.falla_descripcion = ""
    # Clear history for full reset
    if eq.mantenimientos_previos:
        eq.mantenimientos_previos = []
    eq.save()
print("Equipos reseteados.")

print("Base de datos limpia.")
