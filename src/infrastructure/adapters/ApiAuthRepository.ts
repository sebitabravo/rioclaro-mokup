import { User } from '@domain/entities/User';
import { AuthRepository, LoginCredentials, RegisterData, AuthResponse } from '@domain/repositories/AuthRepository';
import { ApiClient } from './ApiClient';

export class ApiAuthRepository implements AuthRepository {
  constructor(private apiClient: ApiClient) {}

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Django Token authentication endpoint
    const tokenResponse = await this.apiClient.post<{ token: string }>('/api/auth/token/', credentials);

    // Configurar el token en el cliente API
    this.apiClient.setToken(tokenResponse.token);

    // Obtener datos del usuario autenticado
    const user = await this.apiClient.get<User>('/api/users/me/');

    return {
      user: user,
      token: tokenResponse.token
    };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    // TODO: Implementar endpoint de registro en el backend Django
    // Por ahora, crear usuario usando el endpoint de users y luego hacer login
    await this.apiClient.post<User>('/api/users/', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      // role: 'observer' // Role might be handled differently
    });

    // Hacer login con las credenciales recién creadas
    return this.login({
      username: userData.username,
      password: userData.password
    });
  }

  async logout(): Promise<void> {
    // Django Token Authentication no tiene endpoint de logout específico
    // Solo limpiamos el token localmente
    this.apiClient.setToken(null);
  }

  async refreshToken(token: string): Promise<string> {
    // Django Token Authentication no expira automáticamente
    // Devolvemos el mismo token ya que es válido hasta que se elimine manualmente
    return token;
  }

  async validateToken(token: string): Promise<User | null> {
    try {
      // Configurar temporalmente el token para la validación
      // Save current token to restore later if needed
      this.apiClient.setToken(token);

      // Usar el endpoint /api/users/me/ para obtener el usuario autenticado
      const user = await this.apiClient.get<User>('/api/users/me/');

      return user;
    } catch {
      // Si hay error, limpiar el token y devolver null
      this.apiClient.setToken(null);
      return null;
    }
  }
}