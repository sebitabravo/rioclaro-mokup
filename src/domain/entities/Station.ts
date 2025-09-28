export interface Station {
  id: number;
  name: string;
  location: string;
  code: string;
  status: 'active' | 'maintenance' | 'inactive';
  latitude: number;
  longitude: number;
  current_level: number;
  threshold: number;
  last_measurement: string;
  created_at: string;
  updated_at: string;
}

// Tipos para crear y actualizar estaciones
export interface CreateStationData {
  name: string;
  location: string;
  code: string;
  status: 'active' | 'maintenance' | 'inactive';
  latitude: number;
  longitude: number;
  current_level: number;
  threshold: number;
  last_measurement: string;
}

export interface UpdateStationData {
  name: string;
  location: string;
  code: string;
  status: 'active' | 'maintenance' | 'inactive';
  latitude: number;
  longitude: number;
  threshold: number;
}
