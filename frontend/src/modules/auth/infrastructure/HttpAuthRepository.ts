import { AuthRepository } from '../domain/repository';
import { AuthCredentials, AuthResponse } from '../domain/types';

export class HttpAuthRepository implements AuthRepository {
  private apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/login/`;

  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Credenciales inválidas');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al conectar con el servidor');
      }

      const data = await response.json();
      console.log('%c✅ CONEXIÓN AL BACKEND EXITOSA (Django)', 'color: #10b981; font-weight: bold; font-size: 14px;');
      console.log('%cDatos recuperados de la base de datos:', 'color: #8b5cf6; font-weight: bold;');
      console.table(data);
      
      return data;
    } catch (error: any) {
      if (error instanceof TypeError) {
        throw new Error('No se pudo conectar con el servidor backend');
      }
      throw error;
    }
  }
}
