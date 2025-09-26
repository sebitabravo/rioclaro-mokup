export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface StationFilters {
  name?: string;
  code?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  latitude?: {
    min?: number;
    max?: number;
  };
  longitude?: {
    min?: number;
    max?: number;
  };
  threshold?: {
    min?: number;
    max?: number;
  };
  current_level?: {
    min?: number;
    max?: number;
  };
}