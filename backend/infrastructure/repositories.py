from domain.ports import UserRepository, WorkOrderRepository, MedicalEquipmentRepository, AuditLogRepository, NotificationRepository
from domain.entities import User, Role, RoleName, WorkOrder, MaintenanceType, OrderStatus, MedicalEquipment, EquipmentStatus, AuditLog, Notification
from .models import CustomUser, Role as DjangoRole, WorkOrder as DjangoWorkOrderModel, MedicalEquipment as DjangoMedicalEquipmentModel, AuditLog as DjangoAuditLogModel, Notification as DjangoNotificationModel
from typing import Optional, List

class DjangoUserRepository(UserRepository):
    def _to_domain(self, django_user: CustomUser) -> User:
        role_domain = None
        if django_user.role:
            role_domain = Role(
                name=RoleName(django_user.role.name),
                permissions=[]
            )
        
        return User(
            id=django_user.id,
            email=django_user.email,
            codigo_unico=django_user.codigo_unico,
            password=django_user.password,
            role=role_domain,
            is_active=django_user.is_active
        )

    def get_by_email_and_codigo(self, email: str, codigo_unico: str) -> Optional[User]:
        try:
            django_user = CustomUser.objects.get(email=email, codigo_unico=codigo_unico)
            return self._to_domain(django_user)
        except CustomUser.DoesNotExist:
            return None

    def get_by_id(self, user_id: int) -> Optional[User]:
        try:
            django_user = CustomUser.objects.get(id=user_id)
            return self._to_domain(django_user)
        except CustomUser.DoesNotExist:
            return None

    def list_all(self) -> List[User]:
        return [self._to_domain(u) for u in CustomUser.objects.all()]

    def list_by_role(self, role_name: str) -> List[User]:
        return [self._to_domain(u) for u in CustomUser.objects.filter(role__name=role_name)]

    def verify_password(self, user: User, password: str) -> bool:
        try:
            django_user = CustomUser.objects.get(id=user.id)
            return django_user.check_password(password)
        except CustomUser.DoesNotExist:
            return False

class DjangoWorkOrderRepository(WorkOrderRepository):
    def _to_domain(self, django_order: DjangoWorkOrderModel) -> WorkOrder:
        user_repo = DjangoUserRepository()
        eq_repo = DjangoMedicalEquipmentRepository()
        
        creado_por = user_repo._to_domain(django_order.creado_por)
        ingeniero = user_repo._to_domain(django_order.ingeniero_asignado) if django_order.ingeniero_asignado else None
        equipo = eq_repo._to_domain(django_order.equipo)
        
        return WorkOrder(
            id=django_order.id,
            tipo_mantenimiento=MaintenanceType(django_order.tipo_mantenimiento),
            estado=OrderStatus(django_order.estado),
            descripcion=django_order.descripcion,
            observaciones_tecnicas=django_order.observaciones_tecnicas,
            equipo=equipo,
            creado_por=creado_por,
            ingeniero_asignado=ingeniero,
            fecha_creacion=django_order.fecha_creacion,
            fecha_inicio=django_order.fecha_inicio,
            fecha_fin=django_order.fecha_fin,
            coordenada_3d_x=django_order.coordenada_3d_x,
            coordenada_3d_y=django_order.coordenada_3d_y,
            coordenada_3d_z=django_order.coordenada_3d_z,
            costo_reparacion=float(django_order.costo_reparacion) if django_order.costo_reparacion else None,
            repuestos_usados=django_order.repuestos_usados,
            problema_real_encontrado=django_order.problema_real_encontrado,
            acciones_realizadas=django_order.acciones_realizadas,
            recomendaciones=django_order.recomendaciones
        )

    def save(self, work_order: WorkOrder) -> WorkOrder:
        creado_por = CustomUser.objects.get(id=work_order.creado_por.id)
        ingeniero = None
        if work_order.ingeniero_asignado:
            ingeniero = CustomUser.objects.get(id=work_order.ingeniero_asignado.id)
        
        django_order, _ = DjangoWorkOrderModel.objects.update_or_create(
            id=work_order.id,
            defaults={
                'tipo_mantenimiento': work_order.tipo_mantenimiento.value,
                'estado': work_order.estado.value,
                'descripcion': work_order.descripcion,
                'observaciones_tecnicas': work_order.observaciones_tecnicas,
                'equipo': DjangoMedicalEquipmentModel.objects.get(id=work_order.equipo.id),
                'creado_por': creado_por,
                'ingeniero_asignado': ingeniero,
                'fecha_inicio': work_order.fecha_inicio,
                'fecha_fin': work_order.fecha_fin
            }
        )
        return self._to_domain(django_order)

    def get_by_id(self, order_id: int) -> Optional[WorkOrder]:
        try:
            django_order = DjangoWorkOrderModel.objects.get(id=order_id)
            return self._to_domain(django_order)
        except DjangoWorkOrderModel.DoesNotExist:
            return None

    def list_all(self) -> List[WorkOrder]:
        return [self._to_domain(o) for o in DjangoWorkOrderModel.objects.all()]

    def list_by_engineer(self, engineer_id: int) -> List[WorkOrder]:
        return [self._to_domain(o) for o in DjangoWorkOrderModel.objects.filter(ingeniero_asignado_id=engineer_id)]

class DjangoMedicalEquipmentRepository(MedicalEquipmentRepository):
    def _to_domain(self, django_eq: DjangoMedicalEquipmentModel) -> MedicalEquipment:
        return MedicalEquipment(
            id=django_eq.id,
            nombre=django_eq.nombre,
            codigo_interno=django_eq.codigo_interno,
            area=django_eq.area,
            estado=EquipmentStatus(django_eq.estado),
            descripcion=django_eq.descripcion,
            fecha_registro=django_eq.fecha_registro,
            marca=django_eq.marca,
            modelo=django_eq.modelo,
            numero_serie=django_eq.numero_serie,
            fecha_adquisicion=django_eq.fecha_adquisicion,
            proveedor=django_eq.proveedor,
            costo=django_eq.costo,
            vida_util=django_eq.vida_util,
            requisitos_energia=django_eq.requisitos_energia,
            dimensiones=django_eq.dimensiones,
            peso=django_eq.peso,
            materiales=django_eq.materiales,
            frecuencia_mantenimiento=django_eq.frecuencia_mantenimiento,
            proximo_mantenimiento=django_eq.proximo_mantenimiento,
            caracteristicas=django_eq.caracteristicas,
            condiciones_uso=django_eq.condiciones_uso,
            certificaciones=django_eq.certificaciones,
            mantenimiento_preventivo=django_eq.mantenimiento_preventivo,
            mantenimiento_correctivo=django_eq.mantenimiento_correctivo,
            mantenimiento_predictivo=django_eq.mantenimiento_predictivo,
            historial=django_eq.historial,
            observaciones=django_eq.observaciones,
            salud_equipo=django_eq.salud_equipo,
            ruta_modelo_3d=django_eq.ruta_modelo_3d,
            analisis_ia=getattr(django_eq, 'analisis_ia', None)
        )

    def save(self, equipment: MedicalEquipment) -> MedicalEquipment:
        django_eq, _ = DjangoMedicalEquipmentModel.objects.update_or_create(
            id=equipment.id,
            defaults={
                'nombre': equipment.nombre,
                'codigo_interno': equipment.codigo_interno,
                'area': equipment.area,
                'estado': equipment.estado.value,
                'descripcion': equipment.descripcion,
                'marca': equipment.marca,
                'modelo': equipment.modelo,
                'numero_serie': equipment.numero_serie,
                'fecha_adquisicion': equipment.fecha_adquisicion,
                'proveedor': equipment.proveedor,
                'costo': equipment.costo,
                'vida_util': equipment.vida_util,
                'requisitos_energia': equipment.requisitos_energia,
                'dimensiones': equipment.dimensiones,
                'peso': equipment.peso,
                'materiales': equipment.materiales,
                'frecuencia_mantenimiento': equipment.frecuencia_mantenimiento,
                'proximo_mantenimiento': equipment.proximo_mantenimiento,
                'caracteristicas': equipment.caracteristicas,
                'condiciones_uso': equipment.condiciones_uso,
                'certificaciones': equipment.certificaciones,
                'mantenimiento_preventivo': equipment.mantenimiento_preventivo,
                'mantenimiento_correctivo': equipment.mantenimiento_correctivo,
                'mantenimiento_predictivo': equipment.mantenimiento_predictivo,
                'historial': equipment.historial,
                'observaciones': equipment.observaciones,
                'salud_equipo': equipment.salud_equipo,
                'ruta_modelo_3d': equipment.ruta_modelo_3d
            }
        )
        return self._to_domain(django_eq)

    def get_by_id(self, equipment_id: int) -> Optional[MedicalEquipment]:
        try:
            django_eq = DjangoMedicalEquipmentModel.objects.get(id=equipment_id)
            return self._to_domain(django_eq)
        except DjangoMedicalEquipmentModel.DoesNotExist:
            return None

    def list_all(self) -> List[MedicalEquipment]:
        return [self._to_domain(e) for e in DjangoMedicalEquipmentModel.objects.all()]

class DjangoAuditLogRepository(AuditLogRepository):
    def _to_domain(self, django_log: DjangoAuditLogModel) -> AuditLog:
        user_repo = DjangoUserRepository()
        user = user_repo._to_domain(django_log.usuario)
        return AuditLog(
            id=django_log.id,
            usuario=user,
            accion=django_log.accion,
            entidad_afectada=django_log.entidad_afectada,
            entidad_id=django_log.entidad_id,
            descripcion=django_log.descripcion,
            fecha=django_log.fecha
        )

    def save(self, log: AuditLog) -> AuditLog:
        django_user = CustomUser.objects.get(id=log.usuario.id)
        django_log = DjangoAuditLogModel.objects.create(
            usuario=django_user,
            accion=log.accion,
            entidad_afectada=log.entidad_afectada,
            entidad_id=log.entidad_id,
            descripcion=log.descripcion
        )
        return self._to_domain(django_log)

    def list_by_entity(self, entity_name: str, entity_id: int) -> List[AuditLog]:
        logs = DjangoAuditLogModel.objects.filter(entidad_afectada=entity_name, entidad_id=entity_id).order_by('-fecha')
        return [self._to_domain(l) for l in logs]

    def list_all(self) -> List[AuditLog]:
        logs = DjangoAuditLogModel.objects.all().order_by('-fecha')
        return [self._to_domain(l) for l in logs]


class DjangoNotificationRepository(NotificationRepository):
    def _to_domain(self, django_notif: DjangoNotificationModel) -> Notification:
        user_repo = DjangoUserRepository()
        user = user_repo._to_domain(django_notif.usuario)
        return Notification(
            id=django_notif.id,
            usuario=user,
            titulo=django_notif.titulo,
            mensaje=django_notif.mensaje,
            leida=django_notif.leida,
            fecha=django_notif.fecha
        )

    def save(self, notification: Notification) -> Notification:
        django_user = CustomUser.objects.get(id=notification.usuario.id)
        django_notif = DjangoNotificationModel.objects.create(
            usuario=django_user,
            titulo=notification.titulo,
            mensaje=notification.mensaje,
            leida=notification.leida
        )
        return self._to_domain(django_notif)

    def list_by_user(self, user_id: int) -> List[Notification]:
        notifs = DjangoNotificationModel.objects.filter(usuario_id=user_id).order_by('-fecha')
        return [self._to_domain(n) for n in notifs]

    def mark_as_read(self, notification_id: int) -> None:
        DjangoNotificationModel.objects.filter(id=notification_id).update(leida=True)

