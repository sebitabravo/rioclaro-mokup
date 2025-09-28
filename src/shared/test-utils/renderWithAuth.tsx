import { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { User } from '@domain/entities/User';
import { mockUsers } from './mockUsers';

/**
 * Custom render function that provides authentication context
 */
export function renderWithAuth(
  ui: ReactElement,
  options: {
    user?: User | null;
    isAuthenticated?: boolean;
    isLoading?: boolean;
    token?: string | null;
  } = {}
) {
  const {
    user = null,
    isAuthenticated = false,
    isLoading = false,
    token = null,
  } = options;

  // Mock the auth store
  const mockAuthStore = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    validateSession: vi.fn(),
    clearError: vi.fn(),
    setLoading: vi.fn(),
  };

  // Mock the useAuth hook
  vi.doMock('@features/auth/stores/AuthStore', () => ({
    useAuth: () => mockAuthStore,
    useAuthStore: () => mockAuthStore,
    useIsAuthenticated: () => isAuthenticated,
    useAuthUser: () => user,
    useAuthLoading: () => isLoading,
    useAuthError: () => null,
  }));

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper }),
    mockAuthStore,
  };
}

/**
 * Render component with specific user role
 */
export function renderWithRole(ui: ReactElement, role: keyof typeof mockUsers) {
  const user = mockUsers[role];
  return renderWithAuth(ui, {
    user,
    isAuthenticated: true,
    token: `mock_token_${user.id}`,
  });
}

/**
 * Render component as unauthenticated user
 */
export function renderUnauthenticated(ui: ReactElement) {
  return renderWithAuth(ui, {
    user: null,
    isAuthenticated: false,
    token: null,
  });
}

/**
 * Render component with loading auth state
 */
export function renderWithLoadingAuth(ui: ReactElement) {
  return renderWithAuth(ui, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });
}