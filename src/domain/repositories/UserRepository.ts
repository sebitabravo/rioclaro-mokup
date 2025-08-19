import { User, CreateUserData, UpdateUserData } from '../entities/User';

export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: number, userData: UpdateUserData): Promise<User | null>;
  delete(id: number): Promise<boolean>;
}