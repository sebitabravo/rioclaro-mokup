import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@domain/entities/User';
import { DIContainer } from '@infrastructure/di/Container';
import { LoginCredentials, RegisterData } from '@domain/repositories/AuthRepository';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  validateSession: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const container = DIContainer.getInstance();
          const loginUseCase = container.loginUseCase;

          const authResponse = await loginUseCase.execute(credentials);

          set({
            user: authResponse.user,
            token: authResponse.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al iniciar sesión',
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const container = DIContainer.getInstance();
          const registerUseCase = container.registerUseCase;

          const authResponse = await registerUseCase.execute(userData);

          set({
            user: authResponse.user,
            token: authResponse.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Error al registrar usuario',
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const container = DIContainer.getInstance();
          const logoutUseCase = container.logoutUseCase;

          await logoutUseCase.execute();

          set({
            ...initialState,
          });
        } catch (error) {
          // Incluso si hay error en el logout del servidor, limpiamos el estado local
          set({
            ...initialState,
            error: error instanceof Error ? error.message : 'Error al cerrar sesión',
          });
        }
      },

      validateSession: async () => {
        const { token } = get();

        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          set({ isLoading: true });

          const container = DIContainer.getInstance();
          const validateTokenUseCase = container.validateTokenUseCase;

          const user = await validateTokenUseCase.execute(token);

          if (user) {
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Token inválido, limpiar estado
            set({
              ...initialState,
            });
          }
        } catch (error) {
          set({
            ...initialState,
            error: error instanceof Error ? error.message : 'Error al validar sesión',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'rioclaro-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hooks adicionales para facilitar el uso
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    validateSession: store.validateSession,
    clearError: store.clearError,
  };
};

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);