import { AuthRepository, LoginCredentials, RegisterData, AuthResponse } from '@domain/repositories/AuthRepository';
import { User } from '@domain/entities/User';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!credentials.username || !credentials.password) {
      throw new Error('Usuario y contraseña son requeridos');
    }

    if (credentials.username.length < 3) {
      throw new Error('El usuario debe tener al menos 3 caracteres');
    }

    if (credentials.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    return await this.authRepository.login(credentials);
  }
}

export class RegisterUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userData: RegisterData): Promise<AuthResponse> {
    // Validaciones
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Usuario, email y contraseña son requeridos');
    }

    if (!userData.first_name || !userData.last_name) {
      throw new Error('Nombre y apellido son requeridos');
    }

    if (userData.username.length < 3) {
      throw new Error('El usuario debe tener al menos 3 caracteres');
    }

    if (userData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('El formato del email no es válido');
    }

    return await this.authRepository.register(userData);
  }
}

export class LogoutUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();
  }
}

export class ValidateTokenUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(token: string): Promise<User | null> {
    if (!token) {
      return null;
    }

    return await this.authRepository.validateToken(token);
  }
}

export class RefreshTokenUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(token: string): Promise<string> {
    if (!token) {
      throw new Error('Token es requerido');
    }

    return await this.authRepository.refreshToken(token);
  }
}