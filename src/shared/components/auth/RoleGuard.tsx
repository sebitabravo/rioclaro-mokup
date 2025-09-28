import { ReactNode } from 'react';
import { useAuth } from '@features/auth/stores/AuthStore';
import { User } from '@domain/entities/User';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<User['role']>;
  fallback?: ReactNode;
  requireExact?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
  requireExact = false
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const hasPermission = requireExact
    ? allowedRoles.includes(user.role)
    : allowedRoles.some(role => {
        // Jerarquía de roles: Administrador > Técnico > Observador
        const roleHierarchy = {
          'Administrador': 3,
          'Técnico': 2,
          'Observador': 1
        };
        const userLevel = roleHierarchy[user.role] || 0;
        const requiredLevel = roleHierarchy[role] || 0;
        return userLevel >= requiredLevel;
      });

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook especializado para verificar permisos de roles
export function useRoleCheck() {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === 'Administrador',
    isTechnician: user?.role === 'Técnico' || user?.role === 'Administrador',
    isObserver: !!user,
    canDelete: user?.role === 'Administrador',
    canEdit: user?.role === 'Administrador' || user?.role === 'Técnico',
    canView: !!user,
    canManageUsers: user?.role === 'Administrador',
    canConfigureAlerts: user?.role === 'Administrador' || user?.role === 'Técnico',
    canExportData: user?.role === 'Administrador' || user?.role === 'Técnico',
    currentRole: user?.role,
    userPermissions: {
      admin: user?.role === 'Administrador',
      technician: user?.role === 'Técnico',
      observer: user?.role === 'Observador'
    }
  };
}

// Hook para verificar si el usuario tiene al menos uno de los roles especificados
export function useHasRole(roles: Array<User['role']>): boolean {
  const { user } = useAuth();

  if (!user) return false;

  return roles.includes(user.role);
}

// Hook para verificar un rol específico con jerarquía
export function useHasPermission(requiredRole: User['role']): boolean {
  const { user } = useAuth();

  if (!user) return false;

  const roleHierarchy = {
    'Administrador': 3,
    'Técnico': 2,
    'Observador': 1
  };

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
}