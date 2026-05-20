import os

file_path = "interfaces/views.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """        try:
            equipo = MedicalEquipment.objects.get(id=equipo_id)
        except MedicalEquipment.DoesNotExist:
            return Response({'error': 'Equipo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
        # Buscar ingeniero disponible"""

replacement = """        try:
            equipo = MedicalEquipment.objects.get(id=equipo_id)
        except MedicalEquipment.DoesNotExist:
            return Response({'error': 'Equipo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
        incidente_activo = IncidentReport.objects.filter(
            equipo=equipo, 
            estado__in=['Pendiente de Inspeccion', 'Inspeccionado']
        ).exists()
        
        if incidente_activo:
            return Response({'error': 'Este equipo ya tiene un reporte activo siendo atendido.'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar ingeniero disponible"""

content = content.replace(target, replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
