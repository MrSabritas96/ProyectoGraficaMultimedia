import os

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target_put_logic = """                # Liberar al ingeniero
                disp = EngineerAvailability.objects.filter(ingeniero=user).first()
                if disp:
                    disp.estado = 'Disponible'
                    disp.save()
                    
                return Response(IncidentReportSerializer(incidente).data)"""

replacement_put_logic = """                # Liberar al ingeniero
                disp = EngineerAvailability.objects.filter(ingeniero=user).first()
                if disp:
                    disp.estado = 'Disponible'
                    disp.save()
                    
                # Notificar al Jefe de Unidad
                from infrastructure.models import Notification
                jefes = CustomUser.objects.filter(role__name='Jefe de Unidad')
                for jefe in jefes:
                    Notification.objects.create(
                        usuario=jefe,
                        titulo="Revisión Técnica Completada",
                        mensaje=f"El Ing. {user.first_name} ha inspeccionado el equipo {incidente.equipo.nombre}. Revisa el reporte para generar la Orden de Trabajo.",
                        leida=False
                    )
                    
                return Response(IncidentReportSerializer(incidente).data)"""

content = content.replace(target_put_logic, replacement_put_logic)

new_view = """
class DirectReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request, pk):
        from infrastructure.models import MedicalEquipment as DjangoEqModel, IncidentReport, Notification
        from django.utils import timezone
        
        try:
            equipo = DjangoEqModel.objects.get(id=pk)
        except DjangoEqModel.DoesNotExist:
            return Response({'error': 'Equipment not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if request.user.role.name != 'Ingeniero Electronico':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        desc = request.data.get('descripcion', '')
        x = request.data.get('x', 0)
        y = request.data.get('y', 0)
        z = request.data.get('z', 0)
        
        # 1. Actualizar el equipo con el punto rojo
        equipo.falla_activa = True
        equipo.falla_coordenada_x = x
        equipo.falla_coordenada_y = y
        equipo.falla_coordenada_z = z
        equipo.falla_descripcion = desc
        equipo.save()
        
        # 2. Crear un Incidente en estado Inspeccionado
        incidente = IncidentReport.objects.create(
            doctor=request.user,  # El ingeniero es quien lo reporta en este caso
            equipo=equipo,
            problema_visible="Falla detectada directamente por ingeniero en rutina.",
            prioridad='Alta',
            descripcion="Reporte generado directamente desde el visor 3D.",
            estado='Inspeccionado',
            ingeniero_asignado=request.user,
            reporte_preliminar_ingeniero=desc,
            fecha_inspeccion=timezone.now()
        )
        
        # 3. Notificar al Jefe de Unidad
        jefes = CustomUser.objects.filter(role__name='Jefe de Unidad')
        for jefe in jefes:
            Notification.objects.create(
                usuario=jefe,
                titulo="Nuevo Reporte Directo de Ingeniero",
                mensaje=f"El Ing. {request.user.first_name} encontró una falla en el equipo {equipo.nombre} y envió el reporte directo.",
                leida=False
            )
            
        return Response({'message': 'Reporte directo creado exitosamente'}, status=status.HTTP_201_CREATED)
"""

if "class DirectReportView" not in content:
    content += new_view

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("views.py patched with DirectReportView and notifications")
