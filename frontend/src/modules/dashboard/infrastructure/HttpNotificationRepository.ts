import Cookies from 'js-cookie';

export interface Notification {
  id: number;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha: string;
}

export class HttpNotificationRepository {
  private apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/notifications/`;

  private getHeaders() {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getMyNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(this.apiUrl, {
        headers: this.getHeaders(),
      });
      if (response.status === 401) {
        // Return empty notifications list gracefully on token expiration
        return [];
      }
      if (!response.ok) throw new Error('Error al obtener notificaciones');
      return response.json();
    } catch (err) {
      console.warn('Failed to fetch notifications gracefully:', err);
      return [];
    }
  }

  async markAsRead(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}${id}/read/`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });
      if (response.status === 401) return;
      if (!response.ok) throw new Error('Error al marcar como leída');
    } catch (err) {
      console.warn('Failed to mark notification as read gracefully:', err);
    }
  }
}
