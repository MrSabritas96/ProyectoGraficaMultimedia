export type EquipmentStatus = 'Activo' | 'En Mantenimiento' | 'Fuera de Servicio' | 'Dado de Baja';

export interface MedicalEquipment {
  id: number;
  nombre: string;
  codigo_interno: string;
  area: string;
  estado: EquipmentStatus;
  descripcion: string;
  fecha_registro: string;
}

export interface CreateEquipmentDTO {
  nombre: string;
  codigo_interno: string;
  area: string;
  descripcion: string;
}
