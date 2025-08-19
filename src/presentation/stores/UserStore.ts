import { create } from 'zustand';
import { User, CreateUserData, UpdateUserData } from '@domain/entities/User';
import { DIContainer } from '@infrastructure/di/Container';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (userData: CreateUserData) => Promise<void>;
  updateUser: (id: number, userData: UpdateUserData) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const users = await container.getUsersUseCase.execute();
      set({ users, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al cargar usuarios',
        loading: false 
      });
    }
  },

  createUser: async (userData: CreateUserData) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const newUser = await container.createUserUseCase.execute(userData);
      const { users } = get();
      set({ users: [...users, newUser], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al crear usuario',
        loading: false 
      });
      throw error; // Re-throw para que el componente pueda manejarlo
    }
  },

  updateUser: async (id: number, userData: UpdateUserData) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const updatedUser = await container.updateUserUseCase.execute(id, userData);
      if (updatedUser) {
        const { users } = get();
        const updatedUsers = users.map(user => 
          user.id === id ? updatedUser : user
        );
        set({ users: updatedUsers, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al actualizar usuario',
        loading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const container = DIContainer.getInstance();
      const success = await container.deleteUserUseCase.execute(id);
      if (success) {
        const { users } = get();
        const filteredUsers = users.filter(user => user.id !== id);
        set({ users: filteredUsers, loading: false });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error al eliminar usuario',
        loading: false 
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));