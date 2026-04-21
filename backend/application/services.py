from domain.ports import UserRepository, TokenService, WorkOrderRepository, MedicalEquipmentRepository, AuditLogRepository, NotificationRepository
from domain.entities import User, WorkOrder, MaintenanceType, OrderStatus, MedicalEquipment, EquipmentStatus, AuditLog, Notification
from typing import Optional, Dict, Any, List
from datetime import datetime
import logging

logger = logging.getLogger('application')

class AuditUseCase:
    def __init__(self, audit_repository: AuditLogRepository):
        self.audit_repository = audit_repository

    def record_event(self, user: User, action: str, entity_name: str, entity_id: int, description: str):
        log = AuditLog(
            id=None,
            usuario=user,
            accion=action,
            entidad_afectada=entity_name,
            entidad_id=entity_id,
            descripcion=description
        )
        self.audit_repository.save(log)
        logger.info(f"AUDIT: {user.email} - {action} - {entity_name} #{entity_id}")

class NotificationUseCase:
    def __init__(self, notification_repository: NotificationRepository):
        self.notification_repo = notification_repository

    def notify_user(self, user: User, titulo: str, mensaje: str):
        notif = Notification(
            id=None,
            usuario=user,
            titulo=titulo,
            mensaje=mensaje,
            leida=False
        )
        self.notification_repo.save(notif)

    def get_user_notifications(self, user_id: int) -> List[Notification]:
        return self.notification_repo.list_by_user(user_id)

    def mark_read(self, notif_id: int):
        self.notification_repo.mark_as_read(notif_id)

class MedicalEquipmentUseCase:
    def __init__(self, equipment_repository: MedicalEquipmentRepository, audit_repo: AuditLogRepository):
        self.equipment_repository = equipment_repository
        self.audit = AuditUseCase(audit_repo)

    def create_equipment(self, nombre: str, codigo: str, area: str, descripcion: str, user: User) -> MedicalEquipment:
        equipment = MedicalEquipment(
            id=None,
            nombre=nombre,
            codigo_interno=codigo,
            area=area,
            estado=EquipmentStatus.ACTIVO,
            descripcion=descripcion
        )
        saved = self.equipment_repository.save(equipment)
        self.audit.record_event(user, "CREACIÓN", "EQUIPO", saved.id, f"Equipo {nombre} registrado")
        return saved

    def list_all(self) -> List[MedicalEquipment]:
        return self.equipment_repository.list_all()

    def get_by_id(self, equipment_id: int) -> Optional[MedicalEquipment]:
        return self.equipment_repository.get_by_id(equipment_id)

class WorkOrderUseCase:
    def __init__(self, work_order_repository: WorkOrderRepository, audit_repo: AuditLogRepository, notification_repo: NotificationRepository):
        self.work_order_repository = work_order_repository
        self.audit = AuditUseCase(audit_repo)
        self.notifier = NotificationUseCase(notification_repo)

    def create_order(self, tipo: str, descripcion: str, equipo: MedicalEquipment, creado_por: User) -> WorkOrder:
        order = WorkOrder(
            id=None,
            tipo_mantenimiento=MaintenanceType(tipo),
            estado=OrderStatus.PENDIENTE,
            descripcion=descripcion,
            equipo=equipo,
            creado_por=creado_por,
            ingeniero_asignado=None
        )
        saved = self.work_order_repository.save(order)
        self.audit.record_event(creado_por, "CREACIÓN", "ORDEN", saved.id, f"Orden de tipo {tipo} creada")
        return saved

    def assign_engineer(self, order_id: int, engineer: User) -> Optional[WorkOrder]:
        order = self.work_order_repository.get_by_id(order_id)
        if not order:
            return None
        order.ingeniero_asignado = engineer
        saved = self.work_order_repository.save(order)
        self.notifier.notify_user(
            engineer, 
            "Nueva Orden Asignada", 
            f"Se te ha asignado la orden #{saved.id}: {saved.descripcion}"
        )
        return saved

    def update_status(self, order_id: int, new_status: str) -> Optional[WorkOrder]:
        order = self.work_order_repository.get_by_id(order_id)
        if not order:
            return None
        order.estado = OrderStatus(new_status)
        return self.work_order_repository.save(order)

    def start_order(self, order_id: int, engineer: User) -> Optional[WorkOrder]:
        order = self.work_order_repository.get_by_id(order_id)
        if not order or not order.ingeniero_asignado or order.ingeniero_asignado.id != engineer.id:
            return None
        
        order.estado = OrderStatus.EN_PROCESO
        order.fecha_inicio = datetime.now()
        saved = self.work_order_repository.save(order)
        self.audit.record_event(engineer, "INICIO", "ORDEN", saved.id, "Mantenimiento iniciado")
        
        # Notify Jefe
        if saved.creado_por:
            self.notifier.notify_user(
                saved.creado_por,
                "Mantenimiento en Curso",
                f"El ingeniero {engineer.email} ha iniciado la orden #{saved.id}"
            )
        return saved

    def finish_order(self, order_id: int, engineer: User, observaciones: str) -> Optional[WorkOrder]:
        order = self.work_order_repository.get_by_id(order_id)
        if not order or not order.ingeniero_asignado or order.ingeniero_asignado.id != engineer.id:
            return None
        
        if order.estado != OrderStatus.EN_PROCESO:
            return None
            
        order.estado = OrderStatus.FINALIZADO
        order.fecha_fin = datetime.now()
        order.observaciones_tecnicas = observaciones
        saved = self.work_order_repository.save(order)
        self.audit.record_event(engineer, "FINALIZACIÓN", "ORDEN", saved.id, "Mantenimiento completado con éxito")
        
        # Notify Jefe
        if saved.creado_por:
            self.notifier.notify_user(
                saved.creado_por,
                "Mantenimiento Finalizado",
                f"La orden #{saved.id} ha sido completada por {engineer.email}"
            )
        return saved

class LoginUseCase:
    def __init__(self, user_repository: UserRepository, token_service: TokenService):
        self.user_repository = user_repository
        self.token_service = token_service

    def execute(self, email: str, codigo_unico: str, password: str) -> Optional[Dict[str, Any]]:
        user = self.user_repository.get_by_email_and_codigo(email, codigo_unico)
        
        if not user or not user.is_active:
            return None
        
        if not self.user_repository.verify_password(user, password):
            return None
        
        token = self.token_service.generate_token(user)
        
        logger.info(f"LOGIN: {email} access granted.")
        
        return {
            "token": token,
            "role": user.role.name.value if user.role else None,
            "user_id": user.id
        }

class ReportUseCase:
    def __init__(self, work_order_repository: WorkOrderRepository, equipment_repository: MedicalEquipmentRepository):
        self.wo_repo = work_order_repository
        self.eq_repo = equipment_repository

    def get_orders_by_status(self) -> Dict[str, int]:
        orders = self.wo_repo.list_all()
        stats = {'Pendiente': 0, 'En Proceso': 0, 'Finalizado': 0}
        for o in orders:
            stats[o.estado.value] += 1
        return stats

    def get_average_repair_time(self) -> float:
        orders = self.wo_repo.list_all()
        finished_orders = [o for o in orders if o.estado == OrderStatus.FINALIZADO and o.fecha_inicio and o.fecha_fin]
        if not finished_orders:
            return 0.0
        total_seconds = sum([(o.fecha_fin - o.fecha_inicio).total_seconds() for o in finished_orders])
        return (total_seconds / len(finished_orders)) / 3600  # Return in hours

    def get_top_failing_equipment(self) -> List[Dict[str, Any]]:
        orders = self.wo_repo.list_all()
        failures = {}
        for o in orders:
            if o.tipo_mantenimiento == MaintenanceType.CORRECTIVO:
                eid = o.equipo.id
                failures[eid] = failures.get(eid, {'nombre': o.equipo.nombre, 'count': 0})
                failures[eid]['count'] += 1
        
        sorted_failures = sorted(failures.values(), key=lambda x: x['count'], reverse=True)
        return sorted_failures[:5]

    def get_orders_by_engineer(self) -> List[Dict[str, Any]]:
        orders = self.wo_repo.list_all()
        eng_stats = {}
        for o in orders:
            if o.ingeniero_asignado:
                name = o.ingeniero_asignado.email
                eng_stats[name] = eng_stats.get(name, 0) + 1
        return [{'engineer': k, 'count': v} for k, v in eng_stats.items()]
