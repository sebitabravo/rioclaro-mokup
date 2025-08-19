import { User, CreateUserData, UpdateUserData } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';
import { mockUsers } from './MockDataRepository';

export class MockUserRepository implements UserRepository {
  private users: User[] = [...mockUsers];

  async findAll(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return [...this.users];
  }

  async findById(id: number): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.users.find(user => user.id === id) || null;
  }

  async create(userData: CreateUserData): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simular validación de email único
    if (this.users.some(user => user.email === userData.email)) {
      throw new Error('El email ya está en uso');
    }
    
    // Simular validación de username único
    if (this.users.some(user => user.username === userData.username)) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    
    const newUser: User = {
      id: Math.max(...this.users.map(u => u.id)) + 1,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.is_superuser ? 'Administrador' : userData.is_staff ? 'Técnico' : 'Observador',
      is_staff: userData.is_staff,
      is_superuser: userData.is_superuser,
      assigned_stations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    return newUser;
  }

  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    // Validar email único (excepto el usuario actual)
    if (this.users.some(user => user.id !== id && user.email === userData.email)) {
      throw new Error('El email ya está en uso');
    }
    
    // Validar username único (excepto el usuario actual)
    if (this.users.some(user => user.id !== id && user.username === userData.username)) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    
    this.users[index] = {
      ...this.users[index],
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.is_superuser ? 'Administrador' : userData.is_staff ? 'Técnico' : 'Observador',
      is_staff: userData.is_staff,
      is_superuser: userData.is_superuser,
      updated_at: new Date().toISOString(),
    };
    
    return this.users[index];
  }

  async delete(id: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }
}