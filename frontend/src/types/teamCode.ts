import type { Center } from './center';

export interface TeamCode {
  id: number;
  code: string;
  description: string | null;
  role: string | null;
  is_active: boolean;
  center_id: number | null;
  center?: Center | null;
  staff_count: number;
  created_at: string;
  updated_at: string;
}

export interface TeamCodeCreateInput {
  code: string;
  description?: string | null;
  role?: string | null;
  is_active?: boolean;
  center_id?: number | null;
}

export type TeamCodeUpdateInput = Partial<TeamCodeCreateInput>;

export interface TeamCodeFilters {
  search?: string;
  is_active?: boolean;
  center_id?: number | null;
}

export interface TeamCodeStatistics {
  total_staff: number;
  active_staff: number;
  inactive_staff: number;
  evaluations_count: number;
  completed_evaluations: number;
  pending_evaluations: number;
  average_score: number | null;
}

export const TEAM_CODE_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'team_leader', label: 'Team Leader' },
  { value: 'physician', label: 'Physician' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'case_coordinator', label: 'Case Coordinator' },
  { value: 'health_coach', label: 'Health Coach' },
];

export const TEAM_CODE_STATUS_OPTIONS: { value: boolean | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];
