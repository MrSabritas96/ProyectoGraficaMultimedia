with open('interfaces/views.py', 'a', encoding='utf-8') as f:
    f.write('''

class IncidentReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role and user.role.name == 'Doctor':
            incidentes = IncidentReport.objects.filter(doctor=user).order_by('-fecha_reporte')
        elif user.role and user.role.name == 'Ingeniero Electronico':
            incidentes = IncidentReport.objects.filter(ingeniero_asignado=user).order_by('-fecha_reporte')
        else: # Jefe o Admin ven todos
            incidentes = IncidentReport.objects.all().order_by('-fecha_reporte')
            
        serializer = IncidentReportSerializer(incidentes, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        if not user.role or user.role.name != 'Doctor':
            return Response({'error': 'Solo doctores pueden reportar incidentes'}, status=status.HTTP_403_FORBIDDEN)
            
        equipo_id = request.data.get('equipo_id')
        problema_visible = request.data.get('problema_visible')
        prioridad = request.data.get('prioridad')
        descripcion = request.data.get('descripcion', '')
        
        try:
            equipo = MedicalEquipment.objects.get(id=equipo_id)
        except MedicalEquipment.DoesNotExist:
            return Response({'error': 'Equipo no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
        # Buscar ingeniero disponible
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
        
        # Opcional: Generar Notificaciones aquí
        
        serializer = IncidentReportSerializer(incidente)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class IncidentReportDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        try:
            incidente = IncidentReport.objects.get(pk=pk)
        except IncidentReport.DoesNotExist:
            return Response({'error': 'Incidente no encontrado'}, status=status.HTTP_404_NOT_FOUND)
            
        user = request.user
        
        # El ingeniero puede actualizar el reporte preliminar y pasarlo a "Inspeccionado"
        if user.role and user.role.name == 'Ingeniero Electronico':
            reporte = request.data.get('reporte_preliminar_ingeniero')
            if reporte:
                incidente.reporte_preliminar_ingeniero = reporte
                incidente.estado = 'Inspeccionado'
                from django.utils import timezone
                incidente.fecha_inspeccion = timezone.now()
                incidente.save()
                
                # Liberar al ingeniero
                disp = EngineerAvailability.objects.filter(ingeniero=user).first()
                if disp:
                    disp.estado = 'Disponible'
                    disp.save()
                    
                return Response(IncidentReportSerializer(incidente).data)
                
        # El jefe puede crear la orden de trabajo (simulado por un cambio de estado si se envía orden_id)
        if user.role and user.role.name in ['Jefe de Unidad', 'Administrador']:
            if 'estado' in request.data:
                incidente.estado = request.data['estado']
            if 'orden_trabajo_relacionada_id' in request.data:
                try:
                    orden = WorkOrder.objects.get(id=request.data['orden_trabajo_relacionada_id'])
                    incidente.orden_trabajo_relacionada = orden
                    incidente.estado = 'Orden Generada'
                except WorkOrder.DoesNotExist:
                    pass
            incidente.save()
            return Response(IncidentReportSerializer(incidente).data)
            
        return Response({'error': 'No autorizado para esta acción'}, status=status.HTTP_403_FORBIDDEN)

class EngineerAvailabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        avails = EngineerAvailability.objects.all()
        serializer = EngineerAvailabilitySerializer(avails, many=True)
        return Response(serializer.data)
''')
