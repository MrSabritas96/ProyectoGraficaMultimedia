from dataclasses import dataclass
from typing import List, Optional
from enum import Enum
from datetime import datetime

class RoleName(Enum):
    ADMINISTRADOR = "Administrador"
    SECRETARIO = "Secretario"
    JEFE_UNIDAD = "Jefe de Unidad"
    INGENIERO_ELECTRONICO = "Ingeniero Electronico"
    DOCTOR = "Doctor"

class MaintenanceType(Enum):
    PREVENTIVO = "Preventivo"
    CORRECTIVO = "Correctivo"

class OrderStatus(Enum):
    PENDIENTE = "Pendiente"
    EN_PROCESO = "En Proceso"
    FINALIZADO = "Finalizado"

class EquipmentStatus(Enum):
    ACTIVO = "Activo"
    EN_MANTENIMIENTO = "En Mantenimiento"
    FUERA_DE_SERVICIO = "Fuera de Servicio"
    DADO_DE_BAJA = "Dado de Baja"

@dataclass
class MedicalEquipment:
    id: Optional[int]
    nombre: str
    codigo_interno: str
    area: str
    estado: EquipmentStatus
    descripcion: str
    fecha_registro: datetime = datetime.now()

@dataclass
class Permission:
    code: str
    description: str

@dataclass
class Role:
    name: RoleName
    permissions: List[Permission]

@dataclass
class User:
    id: Optional[int]
    email: str
    codigo_unico: str
    password: str
    role: Role
    is_active: bool = True


@dataclass
class WorkOrder:
    id: Optional[int]
    tipo_mantenimiento: MaintenanceType
    estado: OrderStatus
    descripcion: str
    equipo: MedicalEquipment
    creado_por: User
    ingeniero_asignado: Optional[User]
    observaciones_tecnicas: Optional[str] = None
    fecha_creacion: datetime = datetime.now()
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
@dataclass
class AuditLog:
    id: Optional[int]
    usuario: User
    accion: str
    entidad_afectada: str
    entidad_id: int
    descripcion: str
    fecha: datetime = datetime.now()

@dataclass
class Notification:
    id: Optional[int]
    usuario: User
    titulo: str
    mensaje: str
    leida: bool
    fecha: datetime = datetime.now()
