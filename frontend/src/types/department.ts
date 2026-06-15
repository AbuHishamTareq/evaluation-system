export interface Department {
  id: number;
  name: string;
  description: string | null;
  center_id: number | null;
  center?: {
    id: number;
    name: string;
    code: string;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentCreateInput {
  name: string;
  description?: string | null;
  center_id?: number | null;
  is_active?: boolean;
}

export type DepartmentUpdateInput = Partial<DepartmentCreateInput>;

export interface DepartmentFilters {
  search?: string;
  is_active?: boolean;
  center_id?: number | null;
  per_page?: number;
}

export const DEPARTMENT_STATUS_OPTIONS: { value: boolean | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];
