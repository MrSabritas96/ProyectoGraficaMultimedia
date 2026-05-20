export interface AuthCredentials {
  email: string;
  codigo_unico: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: string;
  user_id: number;
}
