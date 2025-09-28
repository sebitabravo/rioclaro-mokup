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

