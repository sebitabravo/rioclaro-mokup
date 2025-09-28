// User types for testing different roles and permissions

/**
 * Mock users for testing different roles and permissions
 */
export const mockUsers = {
  administrador: {
    id: 1,
    username: 'admin_user',
    email: 'admin@rioclaro.gov',
    first_name: 'Carlos',
    last_name: 'Administrador',
    role: 'Administrador' as const,
    is_staff: true,
    is_superuser: true,
    assigned_stations: [1, 2, 3, 4, 5] as number[],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-09-28T00:00:00Z',
  },
  tecnico: {
    id: 2,
    username: 'tech_user',
    email: 'tecnico@rioclaro.gov',
    first_name: 'María',
    last_name: 'Técnico',
    role: 'Técnico' as const,
    is_staff: true,
    is_superuser: false,
    assigned_stations: [1, 2, 3] as number[],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-09-28T00:00:00Z',
  },
  observador: {
    id: 3,
    username: 'observer_user',
    email: 'observador@rioclaro.gov',
    first_name: 'Ana',
    last_name: 'Observador',
    role: 'Observador' as const,
    is_staff: true,
    is_superuser: false,
    assigned_stations: [1] as number[],
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-09-28T00:00:00Z',
  },
  inactiveUser: {
    id: 4,
    username: 'inactive_user',
    email: 'inactive@rioclaro.gov',
    first_name: 'Luis',
    last_name: 'Inactivo',
    role: 'Observador' as const,
    is_staff: false, // Inactive user
    is_superuser: false,
    assigned_stations: [] as number[],
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-09-28T00:00:00Z',
  },
} as const;

/**
 * Mock authentication responses for each user type
 */
export const mockAuthResponses = {
  administrador: {
    user: mockUsers.administrador,
    token: 'mock_admin_token_123',
    refresh: 'mock_admin_refresh_123',
  },
  tecnico: {
    user: mockUsers.tecnico,
    token: 'mock_tech_token_456',
    refresh: 'mock_tech_refresh_456',
  },
  observador: {
    user: mockUsers.observador,
    token: 'mock_observer_token_789',
    refresh: 'mock_observer_refresh_789',
  },
  inactiveUser: {
    user: mockUsers.inactiveUser,
    token: 'mock_inactive_token_000',
    refresh: 'mock_inactive_refresh_000',
  },
};

/**
 * Mock login credentials for each user type
 */
export const mockCredentials = {
  administrador: {
    username: 'admin_user',
    password: 'admin123',
  },
  tecnico: {
    username: 'tech_user',
    password: 'tech123',
  },
  observador: {
    username: 'observer_user',
    password: 'observer123',
  },
  inactiveUser: {
    username: 'inactive_user',
    password: 'inactive123',
  },
  invalid: {
    username: 'invalid_user',
    password: 'wrong_password',
  },
};

/**
 * Expected permissions for each role
 */
export const rolePermissions = {
  Administrador: {
    canAccessDashboard: true,
    canAccessReports: true,
    canAccessHistory: true,
    canAccessAlerts: true,
    canAccessAdmin: true,
    canManageUsers: true,
    canManageStations: true,
    canDeleteUsers: true,
    canCreateUsers: true,
    requiresStaff: true,
  },
  Técnico: {
    canAccessDashboard: true,
    canAccessReports: true,
    canAccessHistory: true,
    canAccessAlerts: true,
    canAccessAdmin: false,
    canManageUsers: false,
    canManageStations: false,
    canDeleteUsers: false,
    canCreateUsers: false,
    requiresStaff: false,
  },
  Observador: {
    canAccessDashboard: true,
    canAccessReports: true,
    canAccessHistory: false,
    canAccessAlerts: false,
    canAccessAdmin: false,
    canManageUsers: false,
    canManageStations: false,
    canDeleteUsers: false,
    canCreateUsers: false,
    requiresStaff: false,
  },
} as const;

/**
 * Route access matrix for each role
 */
export const routeAccess = {
  '/dashboard': ['Administrador', 'Técnico', 'Observador'],
  '/reports': ['Administrador', 'Técnico', 'Observador'],
  '/activity': ['Administrador', 'Técnico'],
  '/alerts/configuration': ['Administrador', 'Técnico'],
  '/admin': ['Administrador'],
  '/admin/users': ['Administrador'],
  '/admin/stations': ['Administrador'],
} as const;

/**
 * Navigation items expected for each role
 */
export const expectedNavigation = {
  Administrador: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Análisis', href: '/reports' },
    { name: 'Historial', href: '/activity' },
    { name: 'Alertas', href: '/alerts/configuration' },
    { name: 'Admin', href: '/admin' },
  ],
  Técnico: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Análisis', href: '/reports' },
    { name: 'Historial', href: '/activity' },
    { name: 'Alertas', href: '/alerts/configuration' },
  ],
  Observador: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Análisis', href: '/reports' },
  ],
} as const;