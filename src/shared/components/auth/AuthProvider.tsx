import { useEffect } from 'react';
import { useAuth } from '@features/auth/stores/AuthStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { validateSession } = useAuth();

  useEffect(() => {
    // Validar sesión al cargar la aplicación
    validateSession();

    // Configurar auto-refresh del token cada 20 minutos
    const refreshInterval = setInterval(async () => {
      const token = localStorage.getItem('rioclaro-auth-storage');
      if (token) {
        try {
          const authData = JSON.parse(token);
          if (authData.state?.token) {
            // Intentar refrescar el token silenciosamente
            const container = (await import('@infrastructure/di/Container')).DIContainer.getInstance();
            const newToken = await container.refreshTokenUseCase.execute(authData.state.token);

            // Actualizar el token en localStorage
            const updatedAuthData = {
              ...authData,
              state: {
                ...authData.state,
                token: newToken
              }
            };
            localStorage.setItem('rioclaro-auth-storage', JSON.stringify(updatedAuthData));
          }
        } catch (error) {
          console.warn('Failed to refresh token silently:', error);
          // No hacer nada, el usuario seguirá autenticado hasta que el token expire
        }
      }
    }, 20 * 60 * 1000); // 20 minutos

    return () => {
      clearInterval(refreshInterval);
    };
  }, [validateSession]);

  // Manejar evento de almacenamiento para sincronizar entre pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rioclaro-auth-storage') {
        // Revalidar sesión cuando el almacenamiento cambie
        validateSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [validateSession]);

  return <>{children}</>;
}