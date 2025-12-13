import { StationAssignment, StationAssignmentFilters, CreateStationAssignmentData, UpdateStationAssignmentData } from '@domain/entities/StationAssignment';

export interface StationAssignmentRepository {
  findAll(filters?: StationAssignmentFilters): Promise<StationAssignment[]>;
  findById(id: number): Promise<StationAssignment | null>;
  findByUser(userId: number): Promise<StationAssignment[]>;
  findByStation(stationId: number): Promise<StationAssignment[]>;
  create(data: CreateStationAssignmentData): Promise<StationAssignment>;
  update(id: number, data: UpdateStationAssignmentData): Promise<StationAssignment>;
  delete(id: number): Promise<void>;
}