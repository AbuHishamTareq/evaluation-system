export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface DashboardStats {
  total_staff: number;
  active_staff: number;
  total_questions: number;
  active_questions: number;
  total_evaluations: number;
  active_evaluations: number;
  completed_evaluations: number;
  average_score: number;
  recent_evaluations: Array<{
    id: string | number;
    title: string;
    status: string;
    completed_count: number;
    average_score: number;
  }>;
  staff_by_department?: Array<{
    department: string;
    count: number;
  }>;
  evaluations_by_status?: Array<{
    status: string;
    count: number;
  }>;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  department?: string;
  center_id?: string | number;
}

export interface ExportParams {
  type: 'staff' | 'evaluations' | 'questions' | 'action-plans';
  format: 'excel' | 'csv' | 'pdf';
  filters?: ReportFilters;
}