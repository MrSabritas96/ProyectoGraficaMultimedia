import os

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target_post_logic = """        # Buscar ingeniero disponible
        ingeniero_asignado = None
        disp = EngineerAvailability.objects.filter(estado='Disponible').first()
        if disp:
            ingeniero_asignado = disp.ingeniero
            disp.estado = 'Ocupado'
            disp.save()
            
        incidente = IncidentReport.objects.create(
            doctor=user,
            equipo=equipo,
            problema_visible=problema_visible,
            prioridad=prioridad,
            descripcion=descripcion,
            ingeniero_asignado=ingeniero_asignado,
            estado='Pendiente de Inspeccion'
        )
        
        # Opcional: Generar Notificaciones aquí"""

replacement_post_logic = """        incidente = IncidentReport.objects.create(
            doctor=user,
            equipo=equipo,
            problema_visible=problema_visible,
            prioridad=prioridad,
            descripcion=descripcion,
            ingeniero_asignado=None,
            estado='Pendiente de Inspeccion'
        )
        
        # Generar Notificaciones de Broadcast
        from infrastructure.models import Notification
        disponibles = EngineerAvailability.objects.filter(estado='Disponible')
        for disp in disponibles:
            Notification.objects.create(
                usuario=disp.ingeniero,
                titulo=f"NUEVO REPORTE DE INCIDENTE [INC-{incidente.id}]",
                mensaje=f"🚨 EMERGENCIA: Falla en equipo {equipo.nombre}. Haz clic para reclamar el reporte.",
                leida=False
            )"""

content = content.replace(target_post_logic, replacement_post_logic)

new_views = """
class UnassignedIncidentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if not request.user.role or request.user.role.name != 'Ingeniero Electronico':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        incidentes = IncidentReport.objects.filter(ingeniero_asignado__isnull=True, estado='Pendiente de Inspeccion').order_by('-fecha_reporte')
        serializer = IncidentReportSerializer(incidentes, many=True)
        return Response(serializer.data)

class IncidentAcceptView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        if not request.user.role or request.user.role.name != 'Ingeniero Electronico':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        from django.db import transaction
        from infrastructure.models import Notification
        
        with transaction.atomic():
            incidente = IncidentReport.objects.select_for_update().filter(id=pk).first()
            if not incidente:
                return Response({'error': 'Incidente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
                
            if incidente.ingeniero_asignado is not None:
                return Response({'error': 'Este incidente ya fue aceptado por otro ingeniero'}, status=status.HTTP_400_BAD_REQUEST)
                
            incidente.ingeniero_asignado = request.user
            incidente.save()
            
            av, created = EngineerAvailability.objects.get_or_create(ingeniero=request.user)
            av.estado = 'Ocupado'
            av.save()
            
            Notification.objects.filter(titulo__endswith=f"[INC-{incidente.id}]").delete()
            
        return Response({'message': 'Incidente aceptado exitosamente', 'incidente_id': incidente.id}, status=status.HTTP_200_OK)
"""

if "class UnassignedIncidentListView" not in content:
    content += new_views

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("views.py patched")
