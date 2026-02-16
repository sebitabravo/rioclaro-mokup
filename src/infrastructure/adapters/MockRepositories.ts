// Mock Repositories para desarrollo sin backend
import { StationRepository } from '@domain/repositories/StationRepository';
import { MeasurementRepository } from '@domain/repositories/MeasurementRepository';
import { UserRepository } from '@domain/repositories/UserRepository';
import { AlertRepository, VariableModuleRepository } from '@domain/repositories/AlertRepository';
import { ActivityLogRepository } from '@domain/repositories/ActivityLogRepository';
import { ReportRepository } from '@domain/repositories/ReportRepository';
import { AuthRepository, AuthResponse, LoginCredentials, RegisterData } from '@domain/repositories/AuthRepository';
import { Station } from '@domain/entities/Station';
import { Measurement, MeasurementFilters } from '@domain/entities/Measurement';
import { User, CreateUserData, UpdateUserData } from '@domain/entities/User';
import { Alert, VariableModule } from '@domain/entities/Alert';
import { ActivityLog, ActivityLogFilter } from '@domain/entities/ActivityLog';
import { ReportFilters, ExportFormat, DailyAverageData, CriticalEvent } from '@domain/entities/Report';
import { PaginationParams, PaginatedResult, StationFilters } from '@shared/types/pagination';

type MockAuthUser = User & {
  is_active: boolean;
};

// Datos mock de estaciones
const mockStations: Station[] = [
  {
    id: 1,
    name: "Estación Río Norte",
    code: "RN-001",
    location: "Río Norte",
    latitude: -38.7392,
    longitude: -72.5986,
    status: 'active',
    current_level: 1.5,
    threshold: 2.0,
    last_measurement: new Date().toISOString(),
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-12-10T15:30:00Z"
  },
  {
    id: 2,
    name: "Estación Río Sur",
    code: "RS-002",
    location: "Río Sur",
    latitude: -38.7450,
    longitude: -72.6100,
    status: 'active',
    current_level: 1.8,
    threshold: 2.0,
    last_measurement: new Date().toISOString(),
    created_at: "2024-01-20T12:00:00Z",
    updated_at: "2024-12-10T14:20:00Z"
  },
  {
    id: 3,
    name: "Estación Central",
    code: "CE-003",
    location: "Centro",
    latitude: -38.7398,
    longitude: -72.5920,
    status: 'active',
    current_level: 1.2,
    threshold: 2.0,
    last_measurement: new Date().toISOString(),
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-12-11T10:00:00Z"
  }
];

// Generar mediciones mock
const generateMockMeasurements = (stationId: number, hours: number = 24): Measurement[] => {
  const measurements: Measurement[] = [];
  const now = new Date();

  for (let i = 0; i < hours; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);

    measurements.push({
      id: stationId * 1000 + i,
      station_id: stationId,
      variable_type: "water_level",
      value: 1.5 + Math.random() * 0.5,
      unit: "m",
      timestamp: timestamp.toISOString(),
      is_critical: false,
      quality: "good"
    });

    measurements.push({
      id: stationId * 1000 + i + 100,
      station_id: stationId,
      variable_type: "temperature",
      value: 15 + Math.random() * 5,
      unit: "°C",
      timestamp: timestamp.toISOString(),
      is_critical: false,
      quality: "good"
    });

    measurements.push({
      id: stationId * 1000 + i + 200,
      station_id: stationId,
      variable_type: "ph",
      value: 7 + Math.random() * 0.5,
      unit: "pH",
      timestamp: timestamp.toISOString(),
      is_critical: false,
      quality: "good"
    });
  }

  return measurements;
};

// Mock Station Repository
export class MockStationRepository implements StationRepository {
  async findAll(): Promise<Station[]> {
    return Promise.resolve(mockStations);
  }

  async findById(id: number): Promise<Station | null> {
    const station = mockStations.find(s => s.id === id);
    return Promise.resolve(station || null);
  }

  async create(station: Omit<Station, 'id' | 'created_at' | 'updated_at'>): Promise<Station> {
    const newStation: Station = {
      ...station,
      id: mockStations.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockStations.push(newStation);
    return Promise.resolve(newStation);
  }

  async update(id: number, station: Partial<Station>): Promise<Station | null> {
    const index = mockStations.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStations[index] = { ...mockStations[index], ...station, updated_at: new Date().toISOString() };
      return Promise.resolve(mockStations[index]);
    }
    return Promise.resolve(null);
  }

  async delete(id: number): Promise<boolean> {
    const index = mockStations.findIndex(s => s.id === id);
    if (index !== -1) {
      mockStations.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async findPaginated(params: PaginationParams, filters?: StationFilters): Promise<PaginatedResult<Station>> {
    void filters;
    const start = (params.page - 1) * params.limit;
    const end = start + params.limit;
    const totalPages = Math.ceil(mockStations.length / params.limit);
    return Promise.resolve({
      data: mockStations.slice(start, end),
      pagination: {
        total: mockStations.length,
        page: params.page,
        limit: params.limit,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1
      }
    });
  }
}

// Mock Auth Repository
export class MockAuthRepository implements AuthRepository {
  private activeSessions = new Map<string, User>();

  private mockUsers: MockAuthUser[] = [
    {
      id: 1,
      username: 'admin_user',
      email: 'admin@example.invalid',
      first_name: 'Carlos',
      last_name: 'Administrador',
      role: 'Administrador',
      is_staff: true,
      is_superuser: true,
      assigned_stations: [1, 2, 3, 4, 5],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-09-28T00:00:00Z',
      is_active: true,
    },
    {
      id: 2,
      username: 'tecnico_user',
      email: 'tecnico@example.invalid',
      first_name: 'Ana',
      last_name: 'Técnica',
      role: 'Técnico',
      is_staff: true,
      is_superuser: false,
      assigned_stations: [1, 2, 3],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-09-28T00:00:00Z',
      is_active: true,
    },
    {
      id: 3,
      username: 'observador_user',
      email: 'observador@example.invalid',
      first_name: 'Luis',
      last_name: 'Observador',
      role: 'Observador',
      is_staff: true,
      is_superuser: false,
      assigned_stations: [1],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-09-28T00:00:00Z',
      is_active: true,
    },
    {
      id: 4,
      username: 'inactive_user',
      email: 'inactive@example.invalid',
      first_name: 'Usuario',
      last_name: 'Inactivo',
      role: 'Observador',
      is_staff: true,
      is_superuser: false,
      assigned_stations: [2],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-09-28T00:00:00Z',
      is_active: false,
    },
  ];

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const account = this.mockUsers.find((u) => u.username === credentials.username);

    if (!account || !credentials.password?.trim()) {
      throw new Error('Invalid credentials');
    }

    if (!account.is_active) {
      throw new Error('User account is inactive');
    }

    const user = this.toPublicUser(account);
    const token = this.createToken(user);
    this.activeSessions.set(token, user);

    return { user, token };
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const exists = this.mockUsers.some((u) => u.username === userData.username || u.email === userData.email);
    if (exists) {
      throw new Error('User already exists');
    }

    const now = new Date().toISOString();
    const newUser: MockAuthUser = {
      id: this.mockUsers.length + 1,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: 'Técnico',
      is_staff: true,
      is_superuser: false,
      assigned_stations: [1],
      created_at: now,
      updated_at: now,
      is_active: true,
    };

    this.mockUsers.push(newUser);

    const user = this.toPublicUser(newUser);
    const token = this.createToken(user);
    this.activeSessions.set(token, user);

    return { user, token };
  }

  async logout(): Promise<void> {
    this.activeSessions.clear();
  }

  async refreshToken(token: string): Promise<string> {
    return token;
  }

  async validateToken(token: string): Promise<User | null> {
    if (!token) {
      return null;
    }

    const sessionUser = this.activeSessions.get(token);
    if (sessionUser) {
      return sessionUser;
    }

    try {
      const payload = JSON.parse(atob(token)) as Partial<{ userId: number; username: string; role: string }>;
      const role = this.normalizeRole(payload.role);
      const knownUser = this.mockUsers.find(
        (u) => (payload.userId && u.id === payload.userId) || (payload.username && u.username === payload.username)
      );

      if (knownUser) {
        const user = this.toPublicUser(knownUser);
        const username = payload.username && payload.username.length > 0 ? payload.username : user.username;

        return {
          ...user,
          username,
          role,
          is_staff: true,
          is_superuser: role === 'Administrador',
          assigned_stations: role === 'Administrador' ? [1, 2, 3, 4, 5] : user.assigned_stations.length > 0 ? user.assigned_stations : [1],
        };
      }

      const username = payload.username && payload.username.length > 0 ? payload.username : 'admin';
      const now = new Date().toISOString();

      return {
        id: payload.userId ?? 1,
        username,
        email: `${username}@example.invalid`,
        first_name: role === 'Administrador' ? 'Admin' : 'Usuario',
        last_name: 'Mock',
        role,
        is_staff: true,
        is_superuser: role === 'Administrador',
        assigned_stations: role === 'Administrador' ? [1, 2, 3, 4, 5] : [1],
        created_at: now,
        updated_at: now,
      };
    } catch {
      return null;
    }
  }

  private createToken(user: User): string {
    return btoa(
      JSON.stringify({
        userId: user.id,
        username: user.username,
        role: user.role,
        timestamp: Date.now(),
      })
    );
  }

  private toPublicUser(user: MockAuthUser): User {
    const { is_active, ...publicUser } = user;
    void is_active;
    return publicUser;
  }

  private normalizeRole(role: string | undefined): User['role'] {
    if (role === 'Administrador' || role === 'Técnico' || role === 'Observador') {
      return role;
    }
    return 'Administrador';
  }
}

// Mock Measurement Repository
export class MockMeasurementRepository implements MeasurementRepository {
  async findLatest(stationId?: number): Promise<Measurement[]> {
    if (stationId) {
      return Promise.resolve(generateMockMeasurements(stationId, 1));
    }
    // Devolver últimas mediciones de todas las estaciones
    const all = mockStations.flatMap(s => generateMockMeasurements(s.id, 1));
    return Promise.resolve(all);
  }

  async findHistorical(filters: MeasurementFilters): Promise<Measurement[]> {
    const stationId = filters.station_id || 1;
    let hours = 24;
    
    if (filters.start_date && filters.end_date) {
      const start = new Date(filters.start_date);
      const end = new Date(filters.end_date);
      hours = Math.min(Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60)), 168);
    }
    
    let measurements = generateMockMeasurements(stationId, hours);
    
    if (filters.variable_type) {
      measurements = measurements.filter(m => m.variable_type === filters.variable_type);
    }
    
    return Promise.resolve(measurements);
  }

  async create(measurement: Omit<Measurement, 'id'>): Promise<Measurement> {
    return Promise.resolve({ ...measurement, id: Math.floor(Math.random() * 10000) });
  }
}

// Mock User Repository
export class MockUserRepository implements UserRepository {
  private mockUsers: User[] = [
    {
      id: 1,
      username: "admin",
      email: "admin@example.invalid",
      first_name: "Admin",
      last_name: "Usuario",
      role: "Administrador",
      is_staff: true,
      is_superuser: true,
      assigned_stations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      username: "tecnico1",
      email: "tecnico@example.invalid",
      first_name: "Juan",
      last_name: "Pérez",
      role: "Técnico",
      is_staff: false,
      is_superuser: false,
      assigned_stations: [1, 2],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  async findAll(): Promise<User[]> {
    return Promise.resolve(this.mockUsers);
  }

  async findById(id: number): Promise<User | null> {
    return Promise.resolve(this.mockUsers.find(u => u.id === id) || null);
  }

  async create(userData: CreateUserData): Promise<User> {
    const newUser: User = {
      id: this.mockUsers.length + 1,
      username: userData.username,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: 'Técnico',
      is_staff: userData.is_staff,
      is_superuser: userData.is_superuser,
      assigned_stations: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.mockUsers.push(newUser);
    return Promise.resolve(newUser);
  }

  async update(id: number, userData: UpdateUserData): Promise<User | null> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers[index] = {
        ...this.mockUsers[index],
        username: userData.username,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_staff: userData.is_staff,
        is_superuser: userData.is_superuser,
        updated_at: new Date().toISOString()
      };
      return Promise.resolve(this.mockUsers[index]);
    }
    return Promise.resolve(null);
  }

  async delete(id: number): Promise<boolean> {
    const index = this.mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
      this.mockUsers.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}

// Mock Alert Repository
export class MockAlertRepository implements AlertRepository {
  private mockAlerts: Alert[] = [];

  async findAll(activeOnly?: boolean): Promise<Alert[]> {
    if (activeOnly) {
      return Promise.resolve(this.mockAlerts.filter(a => a.is_active));
    }
    return Promise.resolve(this.mockAlerts);
  }

  async findById(id: number): Promise<Alert | null> {
    return Promise.resolve(this.mockAlerts.find(a => a.id === id) || null);
  }

  async create(alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
    const newAlert: Alert = {
      ...alert,
      id: this.mockAlerts.length + 1,
      created_at: new Date().toISOString()
    };
    this.mockAlerts.push(newAlert);
    return Promise.resolve(newAlert);
  }

  async resolve(id: number): Promise<Alert | null> {
    const index = this.mockAlerts.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockAlerts[index] = {
        ...this.mockAlerts[index],
        is_active: false,
        resolved_at: new Date().toISOString()
      };
      return Promise.resolve(this.mockAlerts[index]);
    }
    return Promise.resolve(null);
  }
}

// Mock Variable Module Repository
export class MockVariableModuleRepository implements VariableModuleRepository {
  private mockModules: VariableModule[] = [
    {
      id: 1,
      name: "Nivel de Agua",
      variable_type: "water_level",
      unit: "m",
      description: "Medición del nivel de agua",
      is_active: true,
      is_default: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Temperatura",
      variable_type: "temperature",
      unit: "°C",
      description: "Medición de temperatura del agua",
      is_active: true,
      is_default: true,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      name: "pH",
      variable_type: "ph",
      unit: "pH",
      description: "Medición del pH del agua",
      is_active: true,
      is_default: true,
      created_at: new Date().toISOString()
    }
  ];

  async findAll(): Promise<VariableModule[]> {
    return Promise.resolve(this.mockModules);
  }

  async findById(id: number): Promise<VariableModule | null> {
    return Promise.resolve(this.mockModules.find(m => m.id === id) || null);
  }

  async create(module: Omit<VariableModule, 'id' | 'created_at'>): Promise<VariableModule> {
    const newModule: VariableModule = {
      ...module,
      id: this.mockModules.length + 1,
      created_at: new Date().toISOString()
    };
    this.mockModules.push(newModule);
    return Promise.resolve(newModule);
  }

  async toggle(id: number, isActive: boolean): Promise<VariableModule | null> {
    const index = this.mockModules.findIndex(m => m.id === id);
    if (index !== -1) {
      this.mockModules[index] = {
        ...this.mockModules[index],
        is_active: isActive
      };
      return Promise.resolve(this.mockModules[index]);
    }
    return Promise.resolve(null);
  }
}

// Mock Activity Log Repository
export class MockActivityLogRepository implements ActivityLogRepository {
  private mockLogs: ActivityLog[] = [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      user_id: 1,
      user_name: "admin",
      activity_type: "user_login",
      title: "Inicio de sesión",
      description: "Inicio de sesión exitoso",
      status: "success",
      ip_address: "192.168.1.1",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user_id: 1,
      user_name: "admin",
      activity_type: "station_created",
      title: "Estación creada",
      description: "Creó estación RN-001",
      status: "success",
      station_id: 1,
      station_name: "Estación Río Norte",
      ip_address: "192.168.1.1",
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  async findAll(filter?: ActivityLogFilter): Promise<ActivityLog[]> {
    void filter;
    return Promise.resolve(this.mockLogs);
  }

  async findById(id: number): Promise<ActivityLog | null> {
    return Promise.resolve(this.mockLogs.find(log => log.id === id) || null);
  }

  async create(activityData: Omit<ActivityLog, 'id' | 'created_at'>): Promise<ActivityLog> {
    const newLog: ActivityLog = {
      ...activityData,
      id: this.mockLogs.length + 1,
      created_at: new Date().toISOString()
    };
    this.mockLogs.push(newLog);
    return Promise.resolve(newLog);
  }

  async deleteById(id: number): Promise<boolean> {
    const index = this.mockLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      this.mockLogs.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async deleteOld(daysToKeep: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.mockLogs.length;
    this.mockLogs = this.mockLogs.filter(log => new Date(log.created_at) > cutoffDate);
    return Promise.resolve(initialCount - this.mockLogs.length);
  }

  async getStats(filter?: ActivityLogFilter): Promise<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentActivity: ActivityLog[];
  }> {
    void filter;
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    this.mockLogs.forEach(log => {
      byType[log.activity_type] = (byType[log.activity_type] || 0) + 1;
      byStatus[log.status] = (byStatus[log.status] || 0) + 1;
    });

    return Promise.resolve({
      total: this.mockLogs.length,
      byType,
      byStatus,
      recentActivity: this.mockLogs.slice(0, 10)
    });
  }
}

// Mock Report Repository
export class MockReportRepository implements ReportRepository {
  async getDailyAverage(filters: ReportFilters): Promise<DailyAverageData[]> {
    void filters;
    return Promise.resolve([
      {
        date: new Date().toISOString(),
        station_name: 'Estación Río Norte',
        average_value: 1.75,
        min_value: 1.2,
        max_value: 2.1,
        measurement_count: 24,
      }
    ]);
  }

  async getCriticalEvents(filters: ReportFilters): Promise<CriticalEvent[]> {
    void filters;
    return Promise.resolve([]);
  }

  async exportReport(type: string, filters: ReportFilters, format: ExportFormat): Promise<void> {
    void type;
    void filters;
    void format;
    return Promise.resolve();
  }
}
