import { WorkOrder, CreateWorkOrderDTO } from '../domain/types';
import Cookies from 'js-cookie';

export class HttpWorkOrderRepository {
  private apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/work-orders/`;
  private historyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/history/`;

  private getHeaders() {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAll(): Promise<WorkOrder[]> {
    const response = await fetch(this.apiUrl, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async getOrderById(id: number): Promise<any> {
    const response = await fetch(`${this.apiUrl}${id}/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener la orden');
    return response.json();
  }

  async create(data: CreateWorkOrderDTO): Promise<WorkOrder> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear la orden');
    return response.json();
  }

  async getEngineers(): Promise<any[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/engineers/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener la lista de ingenieros');
    return response.json();
  }

  async startOrder(id: number, engineerId: number): Promise<void> {
    const response = await fetch(`${this.apiUrl}${id}/start/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ engineer_id: 1 }) // In prod from token
    });
    if (!response.ok) throw new Error('Error al iniciar orden');
  }

  async finishOrder(id: number, engineerId: number, payload: any): Promise<void> {
    const response = await fetch(`${this.apiUrl}${id}/finish/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Error al finalizar orden');
  }

  async addLogToOrder(id: number, nota: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}${id}/log/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ nota })
    });
    if (!response.ok) throw new Error('Error al añadir bitácora');
    return response.json();
  }

  async getHistory(id: number): Promise<any[]> {
    const response = await fetch(`${this.historyUrl}ORDEN/${id}/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener el historial');
    return response.json();
  }
}
