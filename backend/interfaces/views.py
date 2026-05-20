from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import LoginSerializer, WorkOrderSerializer, EquipmentSerializer, UserProfileSerializer, IncidentReportSerializer, EngineerAvailabilitySerializer, RoleSerializer, UserAdminSerializer
from application.services import LoginUseCase, WorkOrderUseCase, MedicalEquipmentUseCase, NotificationUseCase
from infrastructure.repositories import DjangoUserRepository, DjangoWorkOrderRepository, DjangoMedicalEquipmentRepository, DjangoAuditLogRepository, DjangoNotificationRepository
from infrastructure.tokens import JWTTokenService
from .permissions import IsAdmin, IsJefeUnidad, IsIngeniero, IsAdminOrJefe, IsAdminOrSecretario
from infrastructure.models import CustomUser, MedicalEquipment, IncidentReport, EngineerAvailability, Role

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user_repo = DjangoUserRepository()
        token_service = JWTTokenService()
        use_case = LoginUseCase(user_repo, token_service)
        result = use_case.execute(
            email=serializer.validated_data['email'],
            codigo_unico=serializer.validated_data['codigo_unico'],
            password=serializer.validated_data['password']
        )
        if not result:
            return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Update last_login and availability
        from django.utils import timezone
        from infrastructure.models import CustomUser, EngineerAvailability
        django_user = CustomUser.objects.get(id=result['user_id'])
        django_user.last_login = timezone.now()
        django_user.save(update_fields=['last_login'])
        
        # Set availability to 'Disponible' if applicable and not 'Ocupado'
        if django_user.role and django_user.role.name in ['Ingeniero Electronico', 'Jefe de Unidad']:
            av, created = EngineerAvailability.objects.get_or_create(ingeniero=django_user)
            if av.estado != 'Ocupado':
                av.estado = 'Disponible'
                av.save()

        return Response(result, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    def get(self, request):
        user_repo = DjangoUserRepository()
        user = user_repo.get_by_id(request.user.id)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        # Refetch from DB to get the Django model instance with all fields
        django_user = CustomUser.objects.get(id=user.id)
        serializer = UserProfileSerializer(django_user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        # We only allow updating photo, description, cellphone, and password
        django_user = CustomUser.objects.get(id=request.user.id)
        
        if 'photo' in request.FILES:
            django_user.photo = request.FILES['photo']
            
        if 'descripcion_perfil' in request.data:
            django_user.descripcion_perfil = request.data['descripcion_perfil']
            
        if 'cellphone' in request.data:
            django_user.cellphone = request.data['cellphone']
            
        if 'password' in request.data and request.data['password']:
            django_user.set_password(request.data['password'])
            
        django_user.save()
        serializer = UserProfileSerializer(django_user)
        return Response(serializer.data)

class WorkOrderView(APIView):
    def get(self, request):
        repo = DjangoWorkOrderRepository()
        print(f"DEBUG: User ID: {request.user.id}, Role: {request.user.role.name if request.user.role else 'NO ROLE'}")
        
        role_name = request.user.role.name if request.user.role else ""
        
        if 'Ingeniero' in role_name:
            print(f"DEBUG: Filtering for Engineer ID {request.user.id}")
            orders = repo.list_by_engineer(request.user.id)
        else:
            print(f"DEBUG: Showing all orders for {role_name}")
            orders = repo.list_all()
            
        print(f"DEBUG: Found {len(orders)} orders")

        data = []
        for o in orders:
            data.append({
                'id': o.id,
                'tipo_mantenimiento': o.tipo_mantenimiento.value,
                'estado': o.estado.value,
                'descripcion': o.descripcion,
                'observaciones_tecnicas': o.observaciones_tecnicas,
                'equipo_nombre': o.equipo.nombre,
                'equipo_codigo': o.equipo.codigo_interno,
                'area': o.equipo.area,
                'ingeniero_nombre': o.ingeniero_asignado.email if o.ingeniero_asignado else 'Sin asignar',
                'ingeniero_id': o.ingeniero_asignado.id if o.ingeniero_asignado else None,
                'fecha_creacion': o.fecha_creacion,
                'fecha_inicio': o.fecha_inicio,
                'fecha_fin': o.fecha_fin,
                'coordenada_3d_x': o.coordenada_3d_x,
                'coordenada_3d_y': o.coordenada_3d_y,
                'coordenada_3d_z': o.coordenada_3d_z,
                'costo_reparacion': o.costo_reparacion,
                'repuestos_usados': o.repuestos_usados,
                'problema_real_encontrado': o.problema_real_encontrado,
                'acciones_realizadas': o.acciones_realizadas,
                'recomendaciones': o.recomendaciones
            })
        return Response(data)

    def post(self, request):
        if request.user.role.name not in ['Administrador', 'Jefe de Unidad']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorkOrderSerializer(data=request.data)
        if serializer.is_valid():
            user_repo = DjangoUserRepository()
            creado_por = user_repo.get_by_id(request.user.id)
            
            # Engineer assignment
            engineer = None
            eng_id = serializer.validated_data.get('ingeniero_asignado_id')
            if eng_id:
                engineer = user_repo.get_by_id(eng_id)

            eq_repo = DjangoMedicalEquipmentRepository()
            equipo = eq_repo.get_by_id(serializer.validated_data['equipo_id'])
            
            use_case = WorkOrderUseCase(DjangoWorkOrderRepository(), DjangoAuditLogRepository(), DjangoNotificationRepository())
            order = use_case.create_order(
                tipo=serializer.validated_data['tipo_mantenimiento'],
                descripcion=serializer.validated_data['descripcion'],
                equipo=equipo,
                creado_por=creado_por,
                ingeniero=engineer
            )
            
            # Additional fields logic for DB
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
                    print("Error linking incident:", e)
            if 'coordenada_3d_x' in serializer.validated_data:
                django_order.coordenada_3d_x = serializer.validated_data['coordenada_3d_x']
                django_order.coordenada_3d_y = serializer.validated_data['coordenada_3d_y']
                django_order.coordenada_3d_z = serializer.validated_data['coordenada_3d_z']
            django_order.save()
            
            return Response({'id': order.id, 'status': order.estado.value}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkOrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        from infrastructure.models import WorkOrder as DjangoWorkOrderModel
        try:
            o = DjangoWorkOrderModel.objects.get(id=pk)
            data = {
                'id': o.id,
                'tipo_mantenimiento': o.tipo_mantenimiento,
                'estado': o.estado,
                'descripcion': o.descripcion,
                'observaciones_tecnicas': o.observaciones_tecnicas,
                'equipo_nombre': o.equipo.nombre,
                'equipo_codigo': o.equipo.codigo_interno,
                'area': o.equipo.area,
                'ingeniero_nombre': o.ingeniero_asignado.first_name + " " + o.ingeniero_asignado.last_name if o.ingeniero_asignado else 'Sin asignar',
                'ingeniero_id': o.ingeniero_asignado.id if o.ingeniero_asignado else None,
                'fecha_creacion': o.fecha_creacion,
                'fecha_inicio': o.fecha_inicio,
                'fecha_fin': o.fecha_fin,
                'coordenada_3d_x': o.coordenada_3d_x,
                'coordenada_3d_y': o.coordenada_3d_y,
                'coordenada_3d_z': o.coordenada_3d_z,
                'costo_reparacion': o.costo_reparacion,
                'repuestos_usados': o.repuestos_usados,
                'problema_real_encontrado': o.problema_real_encontrado,
                'acciones_realizadas': o.acciones_realizadas,
                'recomendaciones': o.recomendaciones,
                'bitacoras_ingeniero': o.bitacoras_ingeniero
            }
            return Response(data, status=status.HTTP_200_OK)
        except DjangoWorkOrderModel.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

class WorkOrderAddLogView(APIView):
    permission_classes = [IsIngeniero]
    def post(self, request, pk):
        from infrastructure.models import WorkOrder as DjangoWorkOrderModel
        import datetime
        try:
            django_order = DjangoWorkOrderModel.objects.get(id=pk)
            
            # verify it is assigned to this engineer
            if django_order.ingeniero_asignado and django_order.ingeniero_asignado.id != request.user.id:
                return Response({'error': 'Not assigned to this order'}, status=status.HTTP_403_FORBIDDEN)
                
            new_log = {
                'fecha': datetime.datetime.now().isoformat(),
                'nota': request.data.get('nota', ''),
                'autor': f"{request.user.first_name} {request.user.last_name}"
            }
            
            if not isinstance(django_order.bitacoras_ingeniero, list):
                django_order.bitacoras_ingeniero = []
                
            django_order.bitacoras_ingeniero.append(new_log)
            django_order.save()
            
            return Response({'status': 'Log added', 'bitacoras': django_order.bitacoras_ingeniero}, status=status.HTTP_200_OK)
        except DjangoWorkOrderModel.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

class WorkOrderStartView(APIView):
    permission_classes = [IsIngeniero]
    def patch(self, request, pk):
        use_case = WorkOrderUseCase(DjangoWorkOrderRepository(), DjangoAuditLogRepository(), DjangoNotificationRepository())
        user_repo = DjangoUserRepository()
        engineer = user_repo.get_by_id(request.user.id)
        
        order = use_case.start_order(pk, engineer)
        if not order:
            return Response({'error': 'Unauthorized or order not found'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Update IncidentReport status to En Progreso
        from infrastructure.models import IncidentReport as DjangoIncidentModel
        incident = DjangoIncidentModel.objects.filter(orden_trabajo_relacionada__id=order.id).first()
        if incident:
            incident.estado = 'En Progreso'
            incident.save()
            
        return Response({'status': order.estado.value}, status=status.HTTP_200_OK)

class WorkOrderFinishView(APIView):
    permission_classes = [IsIngeniero]
    def patch(self, request, pk):
        use_case = WorkOrderUseCase(DjangoWorkOrderRepository(), DjangoAuditLogRepository(), DjangoNotificationRepository())
        user_repo = DjangoUserRepository()
        engineer = user_repo.get_by_id(request.user.id)
            
        observaciones = request.data.get('observaciones_tecnicas')
        order = use_case.finish_order(pk, engineer, observaciones)
        if not order:
            return Response({'error': 'Unauthorized or invalid state'}, status=status.HTTP_400_BAD_REQUEST)
            
        from infrastructure.models import WorkOrder as DjangoWorkOrderModel
        django_order = DjangoWorkOrderModel.objects.get(id=order.id)
        
        # update extra fields
        if 'costo_reparacion' in request.data: django_order.costo_reparacion = request.data['costo_reparacion']
        if 'repuestos_usados' in request.data: django_order.repuestos_usados = request.data['repuestos_usados']
        if 'problema_real_encontrado' in request.data: django_order.problema_real_encontrado = request.data['problema_real_encontrado']
        if 'acciones_realizadas' in request.data: django_order.acciones_realizadas = request.data['acciones_realizadas']
        if 'recomendaciones' in request.data: django_order.recomendaciones = request.data['recomendaciones']
        if 'repuestos_disponibles' in request.data: django_order.repuestos_disponibles = request.data['repuestos_disponibles']
        django_order.save()
        
        # Turn off falla_activa and archive in mantenimientos_previos
        equipo = django_order.equipo
        if equipo.falla_activa:
            equipo.falla_activa = False
            if isinstance(equipo.mantenimientos_previos, list):
                # find the pending one
                import datetime
                mants = list(equipo.mantenimientos_previos)
                for m in mants:
                    if m.get('status') == 'pending':
                        m['status'] = 'fixed'
                        if 'details' not in m:
                            m['details'] = {}
                        m['details']['fecha_resolucion'] = datetime.date.today().strftime('%d %b %Y')
                        m['details']['aprobado_por'] = request.user.first_name + " " + request.user.last_name
                        m['details']['accion_tomada'] = observaciones or "Mantenimiento completado."
                equipo.mantenimientos_previos = mants
            equipo.save()
            
        # Update IncidentReport status to Resuelto
        from infrastructure.models import IncidentReport as DjangoIncidentModel
        incident = DjangoIncidentModel.objects.filter(orden_trabajo_relacionada__id=order.id).first()
        if incident:
            incident.estado = 'Resuelto'
            incident.save()
            
        return Response({'status': order.estado.value}, status=status.HTTP_200_OK)

class EquipmentView(APIView):
    def get(self, request):
        repo = DjangoMedicalEquipmentRepository()
        
        # We can optimize this by accessing the ORM directly if we want full filtering,
        # but since repo returns all, we will filter in python for now (or update repo).
        # To avoid massive python processing, let's use Django ORM directly here for the read query.
        from infrastructure.models import MedicalEquipment as DjangoEqModel
        
        unidad = request.query_params.get('unidad', None)
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 8))
        
        queryset = DjangoEqModel.objects.all()
        if unidad:
            queryset = queryset.filter(area__iexact=unidad)
            
        total = queryset.count()
        start = (page - 1) * limit
        end = start + limit
        
        equipments = queryset[start:end]
        
        unidades_disponibles = list(DjangoEqModel.objects.values_list('area', flat=True).distinct())
        
        unidades_stats = {}
        for u in unidades_disponibles:
            unidades_stats[u] = DjangoEqModel.objects.filter(area=u, falla_activa=True).count()
        
        data = []
        for e in equipments:
            data.append({
                'id': e.id,
                'nombre': e.nombre,
                'codigo': e.codigo_interno,
                'area': e.area,
                'estado': e.estado,
                'descripcion': e.descripcion,
                'marca': e.marca,
                'modelo': e.modelo,
                'numero_serie': e.numero_serie,
                'fecha_adquisicion': e.fecha_adquisicion,
                'proveedor': e.proveedor,
                'costo': e.costo,
                'vida_util': e.vida_util,
                'requisitos_energia': e.requisitos_energia,
                'dimensiones': e.dimensiones,
                'peso': e.peso,
                'materiales': e.materiales,
                'frecuencia_mantenimiento': e.frecuencia_mantenimiento,
                'proximo_mantenimiento': e.proximo_mantenimiento,
                'caracteristicas': e.caracteristicas,
                'condiciones_uso': e.condiciones_uso,
                'certificaciones': e.certificaciones,
                'mantenimiento_preventivo': e.mantenimiento_preventivo,
                'mantenimiento_correctivo': e.mantenimiento_correctivo,
                'mantenimiento_predictivo': e.mantenimiento_predictivo,
                'historial': e.historial,
                'observaciones': e.observaciones,
                'salud_equipo': e.salud_equipo,
                'ruta_modelo_3d': e.ruta_modelo_3d,
                'mantenimientos_previos': e.mantenimientos_previos,
                'falla_activa': e.falla_activa,
                'falla_coordenada_x': e.falla_coordenada_x,
                'falla_coordenada_y': e.falla_coordenada_y,
                'falla_coordenada_z': e.falla_coordenada_z,
                'falla_descripcion': e.falla_descripcion
            })
            
        return Response({
            'total': total,
            'page': page,
            'limit': limit,
            'unidades': unidades_disponibles,
            'unidades_stats': unidades_stats,
            'results': data
        })

    def post(self, request):
        if request.user.role.name not in ['Administrador', 'Secretario']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = EquipmentSerializer(data=request.data)
        if serializer.is_valid():
            user_repo = DjangoUserRepository()
            user = user_repo.get_by_id(request.user.id)
            use_case = MedicalEquipmentUseCase(DjangoMedicalEquipmentRepository(), DjangoAuditLogRepository())
            eq = use_case.create_equipment(
                nombre=serializer.validated_data['nombre'],
                codigo=serializer.validated_data['codigo_interno'],
                area=serializer.validated_data['area'],
                descripcion=serializer.validated_data['descripcion'],
                user=user
            )
            return Response({'id': eq.id, 'status': eq.estado.value}, status=status.HTTP_201_CREATED)
            return Response({'id': eq.id, 'status': eq.estado.value}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EquipmentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, pk):
        from infrastructure.models import MedicalEquipment as DjangoEqModel
        try:
            e = DjangoEqModel.objects.get(id=pk)
            data = {
                'id': e.id,
                'nombre': e.nombre,
                'codigo': e.codigo_interno,
                'area': e.area,
                'estado': e.estado,
                'descripcion': e.descripcion,
                'marca': e.marca,
                'modelo': e.modelo,
                'numero_serie': e.numero_serie,
                'fecha_adquisicion': e.fecha_adquisicion,
                'proveedor': e.proveedor,
                'costo': e.costo,
                'vida_util': e.vida_util,
                'salud_equipo': e.salud_equipo,
                'ruta_modelo_3d': e.ruta_modelo_3d,
                'mantenimientos_previos': e.mantenimientos_previos,
                'falla_activa': e.falla_activa,
                'falla_coordenada_x': e.falla_coordenada_x,
                'falla_coordenada_y': e.falla_coordenada_y,
                'falla_coordenada_z': e.falla_coordenada_z,
                'falla_descripcion': e.falla_descripcion
            }
            return Response(data, status=status.HTTP_200_OK)
        except DjangoEqModel.DoesNotExist:
            return Response({'error': 'Equipment not found'}, status=status.HTTP_404_NOT_FOUND)

class NotificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        use_case = NotificationUseCase(DjangoNotificationRepository())
        notifs = use_case.get_user_notifications(request.user.id)
        return Response([{
            'id': n.id,
            'titulo': n.titulo,
            'mensaje': n.mensaje,
            'leida': n.leida,
            'fecha': n.fecha
        } for n in notifs])

    def patch(self, request, pk):
        use_case = NotificationUseCase(DjangoNotificationRepository())
        use_case.mark_read(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

class EntityHistoryView(APIView):
    def get(self, request, entity_type, entity_id):
        repo = DjangoAuditLogRepository()
        logs = repo.list_by_entity(entity_type.upper(), entity_id)
        return Response([{
            'id': l.id,
            'usuario': l.usuario.email,
            'accion': l.accion,
            'descripcion': l.descripcion,
            'fecha': l.fecha
        } for l in logs])

from application.services import ReportUseCase

class ReportStatusView(APIView):
    permission_classes = [IsAdminOrJefe]
    def get(self, request):
        use_case = ReportUseCase(DjangoWorkOrderRepository(), DjangoMedicalEquipmentRepository())
        return Response(use_case.get_orders_by_status())

class ReportRepairTimeView(APIView):
    permission_classes = [IsAdminOrJefe]
    def get(self, request):
        use_case = ReportUseCase(DjangoWorkOrderRepository(), DjangoMedicalEquipmentRepository())
        return Response({'average_hours': use_case.get_average_repair_time()})

class ReportTopFailuresView(APIView):
    permission_classes = [IsAdminOrJefe]
    def get(self, request):
        use_case = ReportUseCase(DjangoWorkOrderRepository(), DjangoMedicalEquipmentRepository())
        return Response(use_case.get_top_failing_equipment())

class ReportEngineerPerformanceView(APIView):
    permission_classes = [IsAdminOrJefe]
    def get(self, request):
        use_case = ReportUseCase(DjangoWorkOrderRepository(), DjangoMedicalEquipmentRepository())
        return Response(use_case.get_orders_by_engineer())

class EngineerListView(APIView):
    permission_classes = [IsAdminOrJefe]
    def get(self, request):
        engineers = CustomUser.objects.filter(role__name__icontains='Ingeniero')
        serializer = UserProfileSerializer(engineers, many=True, context={'request': request})
        return Response(serializer.data)

class DoctorListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        doctors = CustomUser.objects.filter(role__name='Doctor')
        serializer = UserProfileSerializer(doctors, many=True, context={'request': request})
        return Response(serializer.data)

class ReportFaultView(APIView):
    permission_classes = [IsIngeniero]
    def post(self, request, pk):
        from infrastructure.models import MedicalEquipment as DjangoEqModel
        from django.utils import timezone
        import random
        try:
            equipo = DjangoEqModel.objects.get(id=pk)
        except DjangoEqModel.DoesNotExist:
            return Response({'error': 'Equipment not found'}, status=status.HTTP_404_NOT_FOUND)
            
        doctor_id = request.data.get('doctor_id')
        doctor_name = "Desconocido"
        if doctor_id:
            try:
                doc = CustomUser.objects.get(id=doctor_id)
                doctor_name = f"Dr. {doc.first_name} {doc.last_name}"
            except CustomUser.DoesNotExist:
                pass
                
        fecha_incidente = request.data.get('fecha_incidente')
        evidencia = request.data.get('evidencia_visible', '')
        desc = request.data.get('descripcion', '')

        equipo.falla_activa = True
        equipo.falla_coordenada_x = request.data.get('x', 0)
        equipo.falla_coordenada_y = request.data.get('y', 0)
        equipo.falla_coordenada_z = request.data.get('z', 0)
        equipo.falla_descripcion = desc
        
        # Generar un ID único para el historial
        new_id = random.randint(1000, 9999)
        
        # Añadir al historial JSON
        nuevo_incidente = {
            "id": new_id,
            "position3D": [equipo.falla_coordenada_x, equipo.falla_coordenada_y, equipo.falla_coordenada_z],
            "title": "Incidente Reportado",
            "description": desc,
            "date": fecha_incidente if fecha_incidente else timezone.now().strftime('%d %b %Y'),
            "engineer": f"Ing. {request.user.first_name} {request.user.last_name}",
            "status": "pending",
            "details": {
                "reportado_por": doctor_name,
                "fecha_ingreso": fecha_incidente if fecha_incidente else timezone.now().strftime('%Y-%m-%d %H:%M'),
                "fecha_resolucion": "Pendiente de revisión por Unidad",
                "accion_tomada": f"Evidencia visible reportada: {evidencia}",
                "aprobado_por": "Pendiente"
            }
        }
        
        mants = equipo.mantenimientos_previos if isinstance(equipo.mantenimientos_previos, list) else []
        mants.append(nuevo_incidente)
        equipo.mantenimientos_previos = mants
        
        equipo.save()
        
        # Generar Notificación para el Jefe de Unidad
        jefes = CustomUser.objects.filter(role__name='Jefe de Unidad')
        from infrastructure.models import Notification
        for jefe in jefes:
            Notification.objects.create(
                usuario=jefe,
                titulo=f"Nuevo Reporte de Falla: {equipo.nombre}",
                mensaje=f"El ingeniero {request.user.first_name} levantó un reporte a solicitud de {doctor_name}. Evidencia: {evidencia[:50]}..."
            )
            
        return Response({'status': 'Reporte guardado exitosamente y registrado en el histórico'}, status=status.HTTP_200_OK)

from infrastructure.models import Role
from .serializers import RoleSerializer, UserAdminSerializer

class RoleAdminListView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True, context={'request': request})
        return Response(serializer.data)

class RoleAdminDetailView(APIView):
    permission_classes = [IsAdmin]
    def put(self, request, pk):
        try:
            role = Role.objects.get(id=pk)
            # Only update permisos for now
            if 'permisos' in request.data:
                role.permisos = request.data['permisos']
            role.save()
            return Response(RoleSerializer(role).data)
        except Role.DoesNotExist:
            return Response({'error': 'Role not found'}, status=status.HTTP_404_NOT_FOUND)

class UserAdminListCreateView(APIView):
    permission_classes = [IsAdmin]
    
    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserAdminSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)
        
    def post(self, request):
        serializer = UserAdminSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            matricula = request.data.get('matricula', '')
            role_id = serializer.validated_data.get('role_id')
            
            # Auto-generate codigo_unico
            prefix = "USR"
            if role_id:
                try:
                    role = Role.objects.get(id=role_id)
                    role_map = {
                        'Administrador': 'ADM',
                        'Jefe de Unidad': 'JEF',
                        'Secretario': 'SEC',
                        'Ingeniero Electronico': 'ING',
                        'Doctor': 'DOC'
                    }
                    prefix = role_map.get(role.name, "USR")
                except Role.DoesNotExist:
                    pass
            
            import random
            base_code = matricula if matricula else str(random.randint(1000, 9999))
            codigo = f"{prefix}-{base_code}"
            
            if CustomUser.objects.filter(email=email).exists() or CustomUser.objects.filter(codigo_unico=codigo).exists():
                return Response({'error': 'Email o código único ya existe (Matrícula duplicada?).'}, status=status.HTTP_400_BAD_REQUEST)
                
            user = CustomUser.objects.create_user(
                email=email,
                codigo_unico=codigo,
                password=request.data.get('password', 'Hospital123*')
            )
            
            if 'first_name' in serializer.validated_data: user.first_name = serializer.validated_data['first_name']
            if 'last_name' in serializer.validated_data: user.last_name = serializer.validated_data['last_name']
            if role_id:
                try:
                    user.role = Role.objects.get(id=role_id)
                except Role.DoesNotExist:
                    pass
            if 'is_active' in serializer.validated_data: user.is_active = serializer.validated_data['is_active']
            if 'ci' in request.data: user.ci = request.data['ci']
            if 'matricula' in request.data: user.matricula = request.data['matricula']
            if 'cellphone' in request.data: user.cellphone = request.data['cellphone']
            if 'descripcion_perfil' in request.data: user.descripcion_perfil = request.data['descripcion_perfil']
            
            user.save()
            return Response(UserAdminSerializer(user, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserAdminDetailView(APIView):
    permission_classes = [IsAdmin]
    
    def put(self, request, pk):
        try:
            user = CustomUser.objects.get(id=pk)
            data = request.data
            if 'first_name' in data: user.first_name = data['first_name']
            if 'last_name' in data: user.last_name = data['last_name']
            if 'email' in data: user.email = data['email']
            if 'role_id' in data:
                try:
                    user.role = Role.objects.get(id=data['role_id'])
                except Role.DoesNotExist:
                    pass
            if 'is_active' in data: user.is_active = data['is_active']
            if 'password' in data and data['password']:
                user.set_password(data['password'])
            
            # Update additional fields
            if 'ci' in data: user.ci = data['ci']
            if 'matricula' in data: user.matricula = data['matricula']
            if 'cellphone' in data: user.cellphone = data['cellphone']
            if 'descripcion_perfil' in data: user.descripcion_perfil = data['descripcion_perfil']
                
            user.save()
            return Response(UserAdminSerializer(user, context={'request': request}).data)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
            
    def delete(self, request, pk):
        try:
            user = CustomUser.objects.get(id=pk)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


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
            
        incidente_activo = IncidentReport.objects.filter(
            equipo=equipo, 
            estado__in=['Pendiente de Inspeccion', 'Inspeccionado']
        ).exists()
        
        if incidente_activo:
            return Response({'error': 'Este equipo ya tiene un reporte activo siendo atendido.'}, status=status.HTTP_400_BAD_REQUEST)

        incidente = IncidentReport.objects.create(
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
            )
        
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
                
                # Actualizar el equipo con el punto rojo
                x = request.data.get('x', 0)
                y = request.data.get('y', 0)
                z = request.data.get('z', 0)
                if x != 0 or y != 0 or z != 0:
                    eq = incidente.equipo
                    eq.falla_activa = True
                    eq.falla_coordenada_x = x
                    eq.falla_coordenada_y = y
                    eq.falla_coordenada_z = z
                    eq.falla_descripcion = reporte
                    
                    # Update the pending history item with the real coordinates
                    if isinstance(eq.mantenimientos_previos, list):
                        mants = list(eq.mantenimientos_previos)
                        for m in mants:
                            if m.get('status') == 'pending':
                                m['position3D'] = [x, y, z]
                                break
                        eq.mantenimientos_previos = mants
                    eq.save()
                
                # Liberar al ingeniero
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
                        leida=False,
                        enlace_destino=f"/dashboard/jefe/work-orders/new?equipmentId={incidente.equipo.id}"
                    )
                    
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
            
            # Send notification to the doctor
            Notification.objects.create(
                usuario=incidente.doctor,
                titulo=f"Incidente Aceptado [INC-{incidente.id}]",
                mensaje=f"Tu reporte del equipo {incidente.equipo.nombre} ha sido aceptado por el ing. {request.user.first_name}. Está en camino.",
                leida=False
            )
            
        return Response({'message': 'Incidente aceptado exitosamente', 'incidente_id': incidente.id}, status=status.HTTP_200_OK)

class MyAssignedIncidentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        if not request.user.role or request.user.role.name != 'Ingeniero Electronico':
            return Response({'error': 'No autorizado'}, status=status.HTTP_403_FORBIDDEN)
            
        incidentes = IncidentReport.objects.filter(ingeniero_asignado=request.user).order_by('-fecha_reporte')
        serializer = IncidentReportSerializer(incidentes, many=True)
        return Response(serializer.data)

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
        
        # Inyectar el incidente pendiente al historial
        import random
        nuevo_incidente = {
            "id": random.randint(1000, 9999),
            "position3D": [x, y, z],
            "title": "Falla Directa",
            "status": "pending",
        }
        mants = list(equipo.mantenimientos_previos) if isinstance(equipo.mantenimientos_previos, list) else []
        mants.append(nuevo_incidente)
        equipo.mantenimientos_previos = mants
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
                leida=False,
                enlace_destino=f"/dashboard/jefe/work-orders/new?equipmentId={equipo.id}"
            )
            
        return Response({'message': 'Reporte directo creado exitosamente'}, status=status.HTTP_201_CREATED)
