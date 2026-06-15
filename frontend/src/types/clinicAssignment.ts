export interface ClinicAssignment {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicAssignmentCreateInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export type ClinicAssignmentUpdateInput = Partial<ClinicAssignmentCreateInput>;

export interface ClinicAssignmentFilters {
  search?: string;
  is_active?: boolean;
  per_page?: number;
}

export const CLINIC_ASSIGNMENT_STATUS_OPTIONS: { value: boolean | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];
