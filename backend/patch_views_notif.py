import os
import re

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For Boss notification
content = content.replace(
    'mensaje=f"El Ing. {user.first_name} ha inspeccionado el equipo {incidente.equipo.nombre}. Revisa el reporte para generar la Orden de Trabajo.",\n                        leida=False',
    'mensaje=f"El Ing. {user.first_name} ha inspeccionado el equipo {incidente.equipo.nombre}. Revisa el reporte para generar la Orden de Trabajo.",\n                        leida=False,\n                        enlace_destino=f"/dashboard/jefe/work-orders/new?equipmentId={incidente.equipo.id}"'
)

# For Boss notification from direct report
content = content.replace(
    'mensaje=f"El Ing. {request.user.first_name} encontró una falla en el equipo {equipo.nombre} y envió el reporte directo.",\n                leida=False',
    'mensaje=f"El Ing. {request.user.first_name} encontró una falla en el equipo {equipo.nombre} y envió el reporte directo.",\n                leida=False,\n                enlace_destino=f"/dashboard/jefe/work-orders/new?equipmentId={equipo.id}"'
)

# For Engineer notification from Doctor report
content = content.replace(
    'mensaje=f"Alerta de Falla en {equipo.nombre} reportada por {request.user.first_name} {request.user.last_name}",\n                    leida=False',
    'mensaje=f"Alerta de Falla en {equipo.nombre} reportada por {request.user.first_name} {request.user.last_name}",\n                    leida=False,\n                    enlace_destino="/dashboard/engineer/alerts"'
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("views.py notifications patched")

# Also patch NotificationSerializer
serializer_path = 'interfaces/serializers.py'
with open(serializer_path, 'r', encoding='utf-8') as f:
    ser_content = f.read()
    
if "enlace_destino =" not in ser_content and "class NotificationSerializer" in ser_content:
    ser_content = ser_content.replace(
        "fecha = serializers.DateTimeField(read_only=True)",
        "fecha = serializers.DateTimeField(read_only=True)\n    enlace_destino = serializers.CharField(required=False, allow_null=True)"
    )
    with open(serializer_path, 'w', encoding='utf-8') as f:
        f.write(ser_content)
    print("serializers.py patched for NotificationSerializer")
