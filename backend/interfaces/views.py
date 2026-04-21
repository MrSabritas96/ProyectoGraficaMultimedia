from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import LoginSerializer, WorkOrderSerializer, EquipmentSerializer
from application.services import LoginUseCase, WorkOrderUseCase, MedicalEquipmentUseCase, NotificationUseCase
from infrastructure.repositories import DjangoUserRepository, DjangoWorkOrderRepository, DjangoMedicalEquipmentRepository, DjangoAuditLogRepository, DjangoNotificationRepository
from infrastructure.tokens import JWTTokenService
from .permissions import IsAdmin, IsJefeUnidad, IsIngeniero, IsAdminOrJefe, IsAdminOrSecretario

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
        return Response(result, status=status.HTTP_200_OK)

class WorkOrderView(APIView):
    def get(self, request):
        repo = DjangoWorkOrderRepository()
        orders = repo.list_all()
        return Response([{'id': o.id, 'tipo': o.tipo_mantenimiento.value, 'estado': o.estado.value} for o in orders])

    def post(self, request):
        if request.user.role.name not in ['Administrador', 'Jefe de Unidad']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)

        serializer = WorkOrderSerializer(data=request.data)
        if serializer.is_valid():
            user_repo = DjangoUserRepository()
            creado_por = user_repo.get_by_id(request.user.id)
            eq_repo = DjangoMedicalEquipmentRepository()
            equipo = eq_repo.get_by_id(serializer.validated_data['equipo_id'])
            
            use_case = WorkOrderUseCase(DjangoWorkOrderRepository(), DjangoAuditLogRepository(), DjangoNotificationRepository())
            order = use_case.create_order(
                tipo=serializer.validated_data['tipo_mantenimiento'],
                descripcion=serializer.validated_data['descripcion'],
                equipo=equipo,
                creado_por=creado_por
            )
            return Response({'id': order.id, 'status': order.estado.value}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkOrderStartView(APIView):
    permission_classes = [IsIngeniero]
    def patch(self, request, pk):
        use_case = WorkOrderUseCase(DjangoWorkOrderRepository(), DjangoAuditLogRepository(), DjangoNotificationRepository())
        user_repo = DjangoUserRepository()
        engineer = user_repo.get_by_id(request.user.id)
        
        order = use_case.start_order(pk, engineer)
        if not order:
            return Response({'error': 'Unauthorized or order not found'}, status=status.HTTP_400_BAD_REQUEST)
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
        return Response({'status': order.estado.value}, status=status.HTTP_200_OK)

class EquipmentView(APIView):
    def get(self, request):
        repo = DjangoMedicalEquipmentRepository()
        equipments = repo.list_all()
        return Response([{'id': e.id, 'nombre': e.nombre, 'codigo': e.codigo_interno, 'area': e.area, 'estado': e.estado.value} for e in equipments])

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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NotificationView(APIView):
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
