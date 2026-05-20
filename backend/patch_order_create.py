import os

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """            # Additional fields logic for DB
            from infrastructure.models import WorkOrder as DjangoWorkOrderModel
            django_order = DjangoWorkOrderModel.objects.get(id=order.id)"""

replacement = """            # Additional fields logic for DB
            from infrastructure.models import WorkOrder as DjangoWorkOrderModel, IncidentReport
            django_order = DjangoWorkOrderModel.objects.get(id=order.id)

            incident_id = request.data.get('incident_id')
            if incident_id:
                try:
                    inc = IncidentReport.objects.get(id=incident_id)
                    inc.estado = 'Orden Generada'
                    inc.orden_trabajo_relacionada = django_order
                    inc.save()
                    
                    # Notify Doctor
                    if inc.doctor:
                        from infrastructure.models import Notification
                        Notification.objects.create(
                            usuario=inc.doctor,
                            titulo="Orden de Trabajo Generada",
                            mensaje=f"El Jefe de Unidad ha asignado una Orden de Trabajo al equipo {equipo.nombre}. Ing. Asignado: {engineer.first_name if engineer else 'N/A'}",
                            enlace_destino="/dashboard/doctor/tracking"
                        )
                except Exception as e:
                    print("Error linking incident:", e)"""

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched WorkOrderCreateView successfully")
else:
    print("Target not found in views.py")
