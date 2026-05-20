import os

filepath = 'interfaces/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_view = """
class MyAssignedIncidentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if not request.user.role or request.user.role.name != 'Ingeniero Electronico':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        incidentes = IncidentReport.objects.filter(ingeniero_asignado=request.user).order_by('-fecha_reporte')
        serializer = IncidentReportSerializer(incidentes, many=True)
        return Response(serializer.data)
"""

if "class MyAssignedIncidentListView" not in content:
    content += new_view
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("views.py patched with MyAssignedIncidentListView")
