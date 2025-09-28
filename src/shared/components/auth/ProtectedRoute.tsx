import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth/stores/AuthStore';
import { PageLoading } from '@shared/components/ui/page-loading';
import { User } from '@domain/entities/User';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Array<User['role']>;
  requireAdmin?: boolean;
  requireStaff?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requireAdmin,
  requireStaff
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, validateSession } = useAuth();
  const location = useLocation();

  // Validar sesión al montar el componente
  useEffect(() => {
    if (!isAuthenticated) {
      validateSession();
    }
  }, [validateSession, isAuthenticated]);

  // Mostrar loading mientras se valida la sesión
  if (isLoading) {
    return <PageLoading />;
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos de rol si están especificados
  if (requiredRoles && requiredRoles.length > 0) {
    // Mapear roles del frontend a roles del backend
    const roleMap: Record<string, string> = {
      'Administrador': 'admin',
      'Técnico': 'technician',
      'Observador': 'observer'
    };

    const userBackendRole = user.role;
    const requiredBackendRoles = requiredRoles.map(role => roleMap[role] || role);

    if (!requiredBackendRoles.includes(userBackendRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Verificar si requiere permisos de administrador
  if (requireAdmin && !user.is_superuser) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar si requiere permisos de staff
  if (requireStaff && !user.is_staff) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}