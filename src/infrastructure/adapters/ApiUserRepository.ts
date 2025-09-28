import { User, CreateUserData, UpdateUserData } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';
import { ApiClient } from './ApiClient';

export class ApiUserRepository implements UserRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(): Promise<User[]> {
    const response = await this.apiClient.get<{ results: User[] }>('/api/users/');
    return response.results;
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await this.apiClient.get<User>(`/api/users/${id}/`);
    } catch {
      return null;
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    return await this.apiClient.post<User>('/api/users/', userData);
  }

  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    try {
      return await this.apiClient.patch<User>(`/api/users/${id}/`, userData);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.apiClient.delete(`/api/users/${id}/`);
      return true;
    } catch {
      return false;
    }
  }
}