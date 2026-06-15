export interface EducationalDegree {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EducationalDegreeCreateInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface EducationalDegreeFilters {
  search?: string;
  is_active?: boolean;
  per_page?: number;
}

export const EDUCATIONAL_DEGREE_STATUS_OPTIONS: { value: boolean | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];
