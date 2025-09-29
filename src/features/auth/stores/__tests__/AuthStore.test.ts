import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../AuthStore';
import { mockUsers, mockCredentials, mockAuthResponses } from '@shared/test-utils';

const {
  mockLoginUseCase,
  mockRegisterUseCase,
  mockLogoutUseCase,
  mockValidateTokenUseCase,
  getInstanceMock,
  localStorageMock,
} = vi.hoisted(() => {
  const mockLoginUseCase = { execute: vi.fn() };
  const mockRegisterUseCase = { execute: vi.fn() };
  const mockLogoutUseCase = { execute: vi.fn() };
  const mockValidateTokenUseCase = { execute: vi.fn() };

  const mockContainerInstance = {
    loginUseCase: mockLoginUseCase,
    registerUseCase: mockRegisterUseCase,
    logoutUseCase: mockLogoutUseCase,
    validateTokenUseCase: mockValidateTokenUseCase,
  };

  const getInstanceMock = vi.fn(() => mockContainerInstance);

  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  });

  return {
    mockLoginUseCase,
    mockRegisterUseCase,
    mockLogoutUseCase,
    mockValidateTokenUseCase,
    getInstanceMock,
    localStorageMock,
  };
});

// Mock DIContainer
vi.mock('@infrastructure/di/Container', () => ({
  DIContainer: {
    getInstance: getInstanceMock,
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginUseCase.execute.mockReset();
    mockRegisterUseCase.execute.mockReset();
    mockLogoutUseCase.execute.mockReset();
    mockValidateTokenUseCase.execute.mockReset();
    getInstanceMock.mockClear();

    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  describe('Initial State', () => {
    it('should initialize with empty auth state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Login Functionality', () => {
    it('should successfully login an Administrator', async () => {
      const { result } = renderHook(() => useAuthStore());
      const mockAuthResponse = mockAuthResponses.administrador;

    mockLoginUseCase.execute.mockResolvedValue(mockAuthResponse);

      await act(async () => {
        await result.current.login(mockCredentials.administrador);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUsers.administrador);
      expect(result.current.token).toBe(mockAuthResponse.token);
      expect(result.current.error).toBeNull();
    });

    it('should successfully login a Técnico', async () => {
      const { result } = renderHook(() => useAuthStore());
      const mockAuthResponse = mockAuthResponses.tecnico;

    mockLoginUseCase.execute.mockResolvedValue(mockAuthResponse);

      await act(async () => {
        await result.current.login(mockCredentials.tecnico);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.role).toBe('Técnico');
      expect(result.current.user?.is_staff).toBe(true);
      expect(result.current.user?.is_superuser).toBe(false);
    });

    it('should successfully login an Observador', async () => {
      const { result } = renderHook(() => useAuthStore());
      const mockAuthResponse = mockAuthResponses.observador;

    mockLoginUseCase.execute.mockResolvedValue(mockAuthResponse);

      await act(async () => {
        await result.current.login(mockCredentials.observador);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.role).toBe('Observador');
      expect(result.current.user?.assigned_stations).toEqual([1]);
    });

    it('should handle login failure with invalid credentials', async () => {
      const { result } = renderHook(() => useAuthStore());
      const loginError = new Error('Invalid credentials');

      mockLoginUseCase.execute.mockRejectedValue(loginError);

      await act(async () => {
        await expect(
          result.current.login(mockCredentials.invalid),
        ).rejects.toThrow('Invalid credentials');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle inactive user login attempt', async () => {
      const { result } = renderHook(() => useAuthStore());
      const inactiveError = new Error('User account is inactive');

      mockLoginUseCase.execute.mockRejectedValue(inactiveError);

      await act(async () => {
        await expect(
          result.current.login(mockCredentials.inactiveUser),
        ).rejects.toThrow('User account is inactive');
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('User account is inactive');
    });

    it('should set loading state during login', async () => {
      const { result } = renderHook(() => useAuthStore());

      mockLoginUseCase.execute.mockImplementationOnce(async () => {
        expect(useAuthStore.getState().isLoading).toBe(true);
        return mockAuthResponses.administrador;
      });

      await act(async () => {
        await result.current.login(mockCredentials.administrador);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Logout Functionality', () => {
    it('should successfully logout and clear state', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
      mockLoginUseCase.execute.mockResolvedValue(mockAuthResponses.administrador);
      await act(async () => {
        await result.current.login(mockCredentials.administrador);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      mockLogoutUseCase.execute.mockResolvedValue(undefined);
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle logout errors gracefully', async () => {
      const { result } = renderHook(() => useAuthStore());

      // First login
    mockLoginUseCase.execute.mockResolvedValue(mockAuthResponses.administrador);
      await act(async () => {
        await result.current.login(mockCredentials.administrador);
      });

      // Logout with error
  const logoutError = new Error('Logout failed');
  mockLogoutUseCase.execute.mockRejectedValue(logoutError);

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear local state even if server logout fails
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Session Validation', () => {
    it('should validate existing session successfully', async () => {
      const { result } = renderHook(() => useAuthStore());
  mockValidateTokenUseCase.execute.mockResolvedValue(mockUsers.administrador);

      act(() => {
        useAuthStore.setState({ token: mockAuthResponses.administrador.token });
      });

      await act(async () => {
        await result.current.validateSession();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUsers.administrador);
    });

    it('should handle invalid session', async () => {
      const { result } = renderHook(() => useAuthStore());

      const sessionError = new Error('Invalid session');
      mockValidateTokenUseCase.execute.mockRejectedValue(sessionError);

      act(() => {
        useAuthStore.setState({ token: 'invalid-token' });
      });

      await act(async () => {
        await result.current.validateSession();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
    });
  });

  describe('Error Management', () => {
    it('should clear errors when requested', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Trigger an error
      const loginError = new Error('Login failed');
      mockLoginUseCase.execute.mockRejectedValue(loginError);

      await act(async () => {
        await expect(
          result.current.login(mockCredentials.invalid),
        ).rejects.toThrow('Login failed');
      });

      expect(result.current.error).toBe('Login failed');

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Role-Based Properties', () => {
    it('should correctly identify Administrator permissions', async () => {
      const { result } = renderHook(() => useAuthStore());

  mockLoginUseCase.execute.mockResolvedValue(mockAuthResponses.administrador);
      await act(async () => {
        await result.current.login(mockCredentials.administrador);
      });

      const user = result.current.user!;
      expect(user.role).toBe('Administrador');
      expect(user.is_staff).toBe(true);
      expect(user.is_superuser).toBe(true);
      expect(user.assigned_stations).toEqual([1, 2, 3, 4, 5]);
    });

    it('should correctly identify Técnico permissions', async () => {
      const { result } = renderHook(() => useAuthStore());

    mockLoginUseCase.execute.mockResolvedValue(mockAuthResponses.tecnico);
      await act(async () => {
        await result.current.login(mockCredentials.tecnico);
      });

      const user = result.current.user!;
      expect(user.role).toBe('Técnico');
      expect(user.is_staff).toBe(true);
      expect(user.is_superuser).toBe(false);
      expect(user.assigned_stations).toEqual([1, 2, 3]);
    });

    it('should correctly identify Observador permissions', async () => {
      const { result } = renderHook(() => useAuthStore());

    mockLoginUseCase.execute.mockResolvedValue(mockAuthResponses.observador);
      await act(async () => {
        await result.current.login(mockCredentials.observador);
      });

      const user = result.current.user!;
      expect(user.role).toBe('Observador');
      expect(user.is_staff).toBe(true);
      expect(user.is_superuser).toBe(false);
      expect(user.assigned_stations).toEqual([1]);
    });
  });

  describe('Persistence', () => {
    it('should persist authentication state to localStorage', async () => {
      const { result } = renderHook(() => useAuthStore());

    mockLoginUseCase.execute.mockResolvedValue(mockAuthResponses.administrador);
      await act(async () => {
        await result.current.login(mockCredentials.administrador);
      });

      // Verify localStorage was called to persist state
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});