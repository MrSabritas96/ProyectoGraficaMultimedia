with open('interfaces/views.py', 'a', encoding='utf-8') as f:
    f.write('''

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        # Set availability to Desconectado
        from infrastructure.models import EngineerAvailability
        av = EngineerAvailability.objects.filter(ingeniero=request.user).first()
        if av and av.estado != 'Ocupado':
            av.estado = 'Desconectado'
            av.save()
        return Response({'message': 'Logged out'}, status=status.HTTP_200_OK)

class ToggleAvailabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def patch(self, request):
        from infrastructure.models import EngineerAvailability
        av, created = EngineerAvailability.objects.get_or_create(ingeniero=request.user)
        
        # If user is Ocupado, they cannot manually toggle it back to Disponible or Fuera until they finish the task
        if av.estado == 'Ocupado':
            return Response({'error': 'No puede cambiar su estado mientras esté en un mantenimiento activo.'}, status=status.HTTP_400_BAD_REQUEST)
            
        new_state = request.data.get('estado')
        if new_state in ['Disponible', 'Fuera de Unidad']:
            av.estado = new_state
            av.save()
            return Response({'estado': av.estado}, status=status.HTTP_200_OK)
            
        return Response({'error': 'Estado inválido'}, status=status.HTTP_400_BAD_REQUEST)
''')
