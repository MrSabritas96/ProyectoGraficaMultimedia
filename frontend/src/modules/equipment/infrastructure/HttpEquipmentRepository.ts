import { MedicalEquipment, CreateEquipmentDTO } from '../domain/types';
import Cookies from 'js-cookie';

export class HttpEquipmentRepository {
  private apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/equipment/`;
  private historyUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/history/`;

  private getHeaders() {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAll(): Promise<MedicalEquipment[]> {
    const response = await fetch(this.apiUrl, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener los equipos');
    const data = await response.json();
    return data.results ? data.results : data;
  }

  async create(data: CreateEquipmentDTO): Promise<MedicalEquipment> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear el equipo');
    return response.json();
  }

  async getHistory(id: number): Promise<any[]> {
    const response = await fetch(`${this.historyUrl}EQUIPO/${id}/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener el historial');
    return response.json();
  }
}
