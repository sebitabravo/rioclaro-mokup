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