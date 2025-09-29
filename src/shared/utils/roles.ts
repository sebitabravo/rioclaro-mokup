import { User } from '@domain/entities/User';

type ApiUser = Omit<User, 'role'> & { role: string };

const sanitize = (value: string) =>
  value
    ?.toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const CANONICAL_ROLES: readonly User['role'][] = ['Administrador', 'Técnico', 'Observador'] as const;

const CANONICAL_BY_SANITIZED = CANONICAL_ROLES.reduce<Record<string, User['role']>>((acc, role) => {
  acc[sanitize(role)] = role;
  return acc;
}, {});

const ROLE_ALIASES: Record<string, User['role']> = {
  admin: 'Administrador',
  administrador: 'Administrador',
  'administrador del sistema': 'Administrador',
  tecnico: 'Técnico',
  technician: 'Técnico',
  technic: 'Técnico',
  'tecnico principal': 'Técnico',
  observador: 'Observador',
  observer: 'Observador',
  viewer: 'Observador'
};

export const AVAILABLE_ROLES = [...CANONICAL_ROLES];

export const ROLE_HIERARCHY: Record<User['role'], number> = {
  Administrador: 3,
  'Técnico': 2,
  Observador: 1
};

export const isAssignableRole = (value: string): value is User['role'] =>
  CANONICAL_ROLES.includes(value as User['role']);

export const normalizeRoleFromApi = (role: string): User['role'] => {
  if (!role) {
    return 'Observador';
  }

  const sanitized = sanitize(role);

  if (ROLE_ALIASES[sanitized]) {
    return ROLE_ALIASES[sanitized];
  }

  if (CANONICAL_BY_SANITIZED[sanitized]) {
    return CANONICAL_BY_SANITIZED[sanitized];
  }

  console.warn(`Rol desconocido recibido desde la API: "${role}". Se asignará Observador por defecto.`);
  return 'Observador';
};

export const mapUserFromApi = (user: ApiUser): User => ({
  ...user,
  role: normalizeRoleFromApi(user.role)
});
