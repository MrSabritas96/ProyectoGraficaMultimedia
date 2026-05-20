export type MaintenanceType = 'Preventivo' | 'Correctivo';
export type OrderStatus = 'Pendiente' | 'En Proceso' | 'Finalizado';

export interface WorkOrder {
  id: number;
  tipo_mantenimiento: MaintenanceType;
  estado: OrderStatus;
  descripcion: string;
  observaciones_tecnicas?: string;
  creado_por_id: number;
  ingeniero_asignado_id?: number | null;
  fecha_creacion: string;
}

export interface CreateWorkOrderDTO {
  tipo_mantenimiento: MaintenanceType;
  descripcion: string;
  equipo_id: number;
  creado_por_id: number;
  ingeniero_asignado_id?: number | null;
}
