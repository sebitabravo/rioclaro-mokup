import { ReactNode } from 'react';
import { useAuth } from '@features/auth/stores/AuthStore';
import { User } from '@domain/entities/User';
import { ROLE_HIERARCHY } from '@shared/utils/roles';

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

  const normalizedAllowedRoles = allowedRoles ?? [];
  const userLevel = ROLE_HIERARCHY[user.role] ?? 0;

  const hasPermission = requireExact
    ? normalizedAllowedRoles.includes(user.role)
    : normalizedAllowedRoles.some(role => {
        const requiredLevel = ROLE_HIERARCHY[role] ?? 0;
        return userLevel >= requiredLevel;
      });

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

