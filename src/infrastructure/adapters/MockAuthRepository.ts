import { AuthRepository, LoginCredentials, RegisterData, AuthResponse } from '@domain/repositories/AuthRepository';
import { User } from '@domain/entities/User';

export class MockAuthRepository implements AuthRepository {
  private users: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@rioclaro.gov.co',
      first_name: 'Administrador',
      last_name: 'Sistema',
      role: 'Administrador',
      is_staff: true,
      is_superuser: true,
      assigned_stations: [1, 2, 3],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      username: 'tecnico',
      email: 'tecnico@rioclaro.gov.co',
      first_name: 'Juan',
      last_name: 'Técnico',
      role: 'Técnico',
      is_staff: true,
      is_superuser: false,
      assigned_stations: [1, 2],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      username: 'observador',
      email: 'observador@rioclaro.gov.co',
      first_name: 'María',
      last_name: 'Observadora',
      role: 'Observador',
      is_staff: false,
      is_superuser: false,
      assigned_stations: [1],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  private mockPasswords = new Map([
    ['admin', 'admin123'],
    ['tecnico', 'tecnico123'],
    ['observador', 'observador123']
  ]);

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = this.users.find(u => u.username === credentials.username);
    const expectedPassword = this.mockPasswords.get(credentials.username);

    if (!user || credentials.password !== expectedPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token mock
    const token = this.generateMockToken(user);

    return {
      user,
      token
    };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verificar si el usuario ya existe
    const existingUser = this.users.find(u =>
      u.username === userData.username || u.email === userData.email
    );

    if (existingUser) {
      throw new Error('El usuario o email ya existe');
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: this.users.length + 1,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: 'Observador', // Rol por defecto para nuevos usuarios
      is_staff: false,
      is_superuser: false,
      assigned_stations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.users.push(newUser);
    this.mockPasswords.set(userData.username, userData.password);

    const token = this.generateMockToken(newUser);

    return {
      user: newUser,
      token
    };
  }

  async logout(): Promise<void> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    // En una implementación real, invalidarías el token en el servidor
  }

  async refreshToken(token: string): Promise<string> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = this.validateMockToken(token);
    if (!user) {
      throw new Error('Token inválido');
    }

    return this.generateMockToken(user);
  }

  async validateToken(token: string): Promise<User | null> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    return this.validateMockToken(token);
  }

  private generateMockToken(user: User): string {
    // Token mock que incluye el ID del usuario y timestamp
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      timestamp: Date.now()
    };

    return btoa(JSON.stringify(payload));
  }

  private validateMockToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token));
      const user = this.users.find(u => u.id === payload.userId);

      // Verificar que el token no haya expirado (24 horas)
      const tokenAge = Date.now() - payload.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 horas

      if (tokenAge > maxAge) {
        return null;
      }

      return user || null;
    } catch {
      return null;
    }
  }
}