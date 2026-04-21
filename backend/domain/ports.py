from abc import ABC, abstractmethod
from typing import Optional, List
from .entities import User, WorkOrder, MedicalEquipment, AuditLog, Notification

class UserRepository(ABC):
    @abstractmethod
    def get_by_email_and_codigo(self, email: str, codigo_unico: str) -> Optional[User]:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[User]:
        pass

    @abstractmethod
    def verify_password(self, user: User, password: str) -> bool:
        pass

class MedicalEquipmentRepository(ABC):
    @abstractmethod
    def save(self, equipment: MedicalEquipment) -> MedicalEquipment:
        pass

    @abstractmethod
    def get_by_id(self, equipment_id: int) -> Optional[MedicalEquipment]:
        pass

    @abstractmethod
    def list_all(self) -> List[MedicalEquipment]:
        pass

class WorkOrderRepository(ABC):
    @abstractmethod
    def save(self, work_order: WorkOrder) -> WorkOrder:
        pass

    @abstractmethod
    def get_by_id(self, order_id: int) -> Optional[WorkOrder]:
        pass

    @abstractmethod
    def list_all(self) -> List[WorkOrder]:
        pass

    @abstractmethod
    def list_by_engineer(self, engineer_id: int) -> List[WorkOrder]:
        pass

class AuditLogRepository(ABC):
    @abstractmethod
    def save(self, log: AuditLog) -> AuditLog:
        pass

    @abstractmethod
    def list_by_entity(self, entity_name: str, entity_id: int) -> List[AuditLog]:
        pass

    @abstractmethod
    def list_all(self) -> List[AuditLog]:
        pass

class NotificationRepository(ABC):
    @abstractmethod
    def save(self, notification: Notification) -> Notification:
        pass

    @abstractmethod
    def list_by_user(self, user_id: int) -> List[Notification]:
        pass

    @abstractmethod
    def mark_as_read(self, notification_id: int) -> None:
        pass

class TokenService(ABC):
    @abstractmethod
    def generate_token(self, user: User) -> str:
        pass
