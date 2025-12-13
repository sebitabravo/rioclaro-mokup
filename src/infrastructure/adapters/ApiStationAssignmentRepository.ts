import { StationAssignment, StationAssignmentFilters, CreateStationAssignmentData, UpdateStationAssignmentData } from '@domain/entities/StationAssignment';
import { StationAssignmentRepository } from '@domain/repositories/StationAssignmentRepository';
import { ApiClient } from './ApiClient';

interface ApiStationAssignmentData {
  id: number;
  user: number;
  user_name?: string;
  user_email?: string;
  station: number;
  station_name?: string;
  station_code?: string;
  assigned_at: string;
  assigned_by?: number;
  assigned_by_name?: string;
}

export class ApiStationAssignmentRepository implements StationAssignmentRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(filters?: StationAssignmentFilters): Promise<StationAssignment[]> {
    let endpoint = '/api/stations/assignments/';

    const queryParams = new URLSearchParams();

    if (filters?.user_id) {
      queryParams.append('user', filters.user_id.toString());
    }

    if (filters?.station_id) {
      queryParams.append('station', filters.station_id.toString());
    }

    endpoint += `?${queryParams}`;

    const response = await this.apiClient.get<ApiStationAssignmentData[]>(endpoint);
    return response.map(this.convertApiToStationAssignment);
  }

  async findById(id: number): Promise<StationAssignment | null> {
    try {
      const response = await this.apiClient.get<ApiStationAssignmentData>(`/api/stations/assignments/${id}/`);
      return this.convertApiToStationAssignment(response);
    } catch (error) {
      return null;
    }
  }

  async findByUser(userId: number): Promise<StationAssignment[]> {
    return this.findAll({ user_id: userId });
  }

  async findByStation(stationId: number): Promise<StationAssignment[]> {
    return this.findAll({ station_id: stationId });
  }

  async create(data: CreateStationAssignmentData): Promise<StationAssignment> {
    const response = await this.apiClient.post<ApiStationAssignmentData>('/api/stations/assignments/', data);
    return this.convertApiToStationAssignment(response);
  }

  async update(id: number, data: UpdateStationAssignmentData): Promise<StationAssignment> {
    const response = await this.apiClient.patch<ApiStationAssignmentData>(`/api/stations/assignments/${id}/`, data);
    return this.convertApiToStationAssignment(response);
  }

  async delete(id: number): Promise<void> {
    await this.apiClient.delete(`/api/stations/assignments/${id}/`);
  }

  private convertApiToStationAssignment(data: ApiStationAssignmentData): StationAssignment {
    return {
      id: data.id,
      user_id: data.user,
      user_name: data.user_name,
      user_email: data.user_email,
      station_id: data.station,
      station_name: data.station_name,
      station_code: data.station_code,
      assigned_at: data.assigned_at,
      assigned_by: data.assigned_by,
      assigned_by_name: data.assigned_by_name
    };
  }
}