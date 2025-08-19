// Mock data repository para desarrollo sin backend
import { Station } from '@domain/entities/Station';
import { User } from '@domain/entities/User';
import { Measurement } from '@domain/entities/Measurement';
import { Alert, VariableModule } from '@domain/entities/Alert';
import { DailyAverageData, CriticalEvent } from '@domain/entities/Report';

export const mockStations: Station[] = [
  {
    id: 1,
    name: "Estación Río Claro Norte",
    location: "Pucón Norte, Región de La Araucanía",
    code: "RCN-001",
    status: "active",
    latitude: -39.290745,
    longitude: -71.931994,
    current_level: 2.45,
    threshold: 3.0,
    last_measurement: "2025-01-13T10:30:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-13T10:30:00Z",
  },
  {
    id: 2,
    name: "Estación Río Claro Centro",
    location: "Pucón Centro, Región de La Araucanía",
    code: "RCC-002",
    status: "active",
    latitude: -39.283331,
    longitude: -71.938868,
    current_level: 1.85,
    threshold: 2.5,
    last_measurement: "2025-01-13T10:30:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-13T10:30:00Z",
  },
  {
    id: 3,
    name: "Estación Río Claro Sur",
    location: "Pucón Sur, Región de La Araucanía",
    code: "RCS-003",
    status: "maintenance",
    latitude: -39.281843,
    longitude: -71.940563,
    current_level: 3.2,
    threshold: 3.5,
    last_measurement: "2025-01-13T09:45:00Z",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-13T09:45:00Z",
  },
];

export const mockUsers: User[] = [
  {
    id: 1,
    username: "admin.gobierno",
    email: "admin@digital.gob.cl",
    first_name: "María",
    last_name: "González",
    role: "Administrador",
    is_staff: true,
    is_superuser: true,
    assigned_stations: [1, 2, 3],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    username: "tecnico.pucon",
    email: "tecnico@pucon.cl",
    first_name: "Carlos",
    last_name: "Martínez",
    role: "Técnico",
    is_staff: true,
    is_superuser: false,
    assigned_stations: [1, 2],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 3,
    username: "observador.regional",
    email: "observador@araucania.gob.cl",
    first_name: "Ana",
    last_name: "López",
    role: "Observador",
    is_staff: false,
    is_superuser: false,
    assigned_stations: [3],
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
];

export const mockMeasurements: Measurement[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  station: 1,
  station_name: "Estación Río Claro Norte",
  variable_type: "water_level",
  value: 2.3 + Math.sin(i * 0.5) * 0.4 + Math.random() * 0.2,
  unit: "m",
  timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
  is_critical: false,
  quality: "good",
}));

export const mockAlerts: Alert[] = [
  {
    id: 1,
    station: 3,
    station_name: "Estación Río Claro Sur",
    variable_type: "water_level",
    threshold_value: 3.0,
    current_value: 3.2,
    alert_type: "high_level",
    message: "Nivel del agua superó el umbral crítico (3.2m > 3.0m)",
    severity: "high",
    is_active: true,
    created_at: "2025-01-13T09:45:00Z",
  },
  {
    id: 2,
    station: 1,
    station_name: "Estación Río Claro Norte",
    variable_type: "water_level",
    threshold_value: 3.0,
    current_value: 2.45,
    alert_type: "maintenance",
    message: "Mantenimiento programado completado",
    severity: "low",
    is_active: false,
    created_at: "2025-01-12T14:30:00Z",
    resolved_at: "2025-01-12T16:00:00Z",
  },
];

export const mockVariableModules: VariableModule[] = [
  {
    id: 1,
    name: "Nivel del Agua",
    variable_type: "water_level",
    unit: "m",
    description: "Variable principal del sistema de monitoreo",
    is_active: true,
    is_default: true,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Turbidez del Agua",
    variable_type: "turbidity",
    unit: "NTU",
    description: "Medición de la calidad del agua",
    is_active: false,
    is_default: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Temperatura del Agua",
    variable_type: "temperature",
    unit: "°C",
    description: "Temperatura del agua y ambiente",
    is_active: false,
    is_default: false,
    created_at: "2025-01-01T00:00:00Z",
  },
];

export const mockDailyAverageData: DailyAverageData[] = [
  { date: "2025-01-07", station_name: "Río Claro Norte", average_value: 2.1, min_value: 1.9, max_value: 2.3, measurement_count: 96 },
  { date: "2025-01-08", station_name: "Río Claro Norte", average_value: 2.3, min_value: 2.1, max_value: 2.5, measurement_count: 96 },
  { date: "2025-01-09", station_name: "Río Claro Norte", average_value: 2.8, min_value: 2.4, max_value: 3.1, measurement_count: 96 },
  { date: "2025-01-10", station_name: "Río Claro Norte", average_value: 2.6, min_value: 2.3, max_value: 2.9, measurement_count: 96 },
  { date: "2025-01-11", station_name: "Río Claro Norte", average_value: 2.4, min_value: 2.2, max_value: 2.7, measurement_count: 96 },
  { date: "2025-01-12", station_name: "Río Claro Norte", average_value: 2.2, min_value: 2.0, max_value: 2.4, measurement_count: 96 },
  { date: "2025-01-13", station_name: "Río Claro Norte", average_value: 2.5, min_value: 2.3, max_value: 2.7, measurement_count: 96 },
];

export const mockCriticalEvents: CriticalEvent[] = [
  {
    id: 1,
    station_name: "Río Claro Sur",
    water_level: 3.2,
    threshold: 3.0,
    timestamp: "2025-01-13T09:45:00Z",
    duration_minutes: 45,
  },
  {
    id: 2,
    station_name: "Río Claro Norte",
    water_level: 3.1,
    threshold: 3.0,
    timestamp: "2025-01-11T15:20:00Z",
    duration_minutes: 120,
  },
];