export interface StationAssignment {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  station_id: number;
  station_name?: string;
  station_code?: string;
  assigned_at: string;
  assigned_by?: number;
  assigned_by_name?: string;
}

export interface StationAssignmentFilters {
  user_id?: number;
  station_id?: number;
}

export interface CreateStationAssignmentData {
  user: number;
  station: number;
}

export type UpdateStationAssignmentData = Partial<CreateStationAssignmentData>;
