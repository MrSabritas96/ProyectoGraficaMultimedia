import { AuthCredentials, AuthResponse } from './types';

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<AuthResponse>;
}
