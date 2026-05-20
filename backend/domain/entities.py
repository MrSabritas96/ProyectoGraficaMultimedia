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
    codigo_interno: Optional[str]
    area: str
    estado: EquipmentStatus
    descripcion: Optional[str]
    fecha_registro: datetime = datetime.now()
    
    # Expanded Fields from Excel
    marca: Optional[str] = None
    modelo: Optional[str] = None
    numero_serie: Optional[str] = None
    fecha_adquisicion: Optional[datetime] = None
    proveedor: Optional[str] = None
    costo: Optional[float] = None
    vida_util: Optional[str] = None
    requisitos_energia: Optional[str] = None
    dimensiones: Optional[str] = None
    peso: Optional[str] = None
    materiales: Optional[str] = None
    frecuencia_mantenimiento: Optional[int] = None
    proximo_mantenimiento: Optional[datetime] = None
    caracteristicas: Optional[str] = None
    condiciones_uso: Optional[str] = None
    certificaciones: Optional[str] = None
    mantenimiento_preventivo: Optional[str] = None
    mantenimiento_correctivo: Optional[str] = None
    mantenimiento_predictivo: Optional[str] = None
    historial: Optional[str] = None
    observaciones: Optional[str] = None
    
    # AI and 3D Model Additions
    salud_equipo: Optional[int] = None
    ruta_modelo_3d: Optional[str] = None
    analisis_ia: Optional[str] = None

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
    
    # 3D Coordinates
    coordenada_3d_x: Optional[float] = None
    coordenada_3d_y: Optional[float] = None
    coordenada_3d_z: Optional[float] = None
    
    # Detailed report data
    costo_reparacion: Optional[float] = None
    repuestos_usados: Optional[list] = None
    problema_real_encontrado: Optional[str] = None
    acciones_realizadas: Optional[str] = None
    recomendaciones: Optional[str] = None
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
