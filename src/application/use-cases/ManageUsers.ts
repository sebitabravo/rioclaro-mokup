import { User, CreateUserData, UpdateUserData } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';

export class GetUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userData: CreateUserData): Promise<User> {
    // Validaciones de negocio
    if (!userData.username.trim()) {
      throw new Error('El nombre de usuario es requerido');
    }
    
    if (!userData.email.trim()) {
      throw new Error('El email es requerido');
    }
    
    if (!userData.password.trim()) {
      throw new Error('La contraseña es requerida');
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Formato de email inválido');
    }
    
    return await this.userRepository.create(userData);
  }
}

export class UpdateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number, userData: UpdateUserData): Promise<User | null> {
    if (id <= 0) {
      throw new Error('ID de usuario inválido');
    }
    
    if (!userData.username.trim()) {
      throw new Error('El nombre de usuario es requerido');
    }
    
    if (!userData.email.trim()) {
      throw new Error('El email es requerido');
    }
    
    return await this.userRepository.update(id, userData);
  }
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('ID de usuario inválido');
    }
    
    return await this.userRepository.delete(id);
  }
}