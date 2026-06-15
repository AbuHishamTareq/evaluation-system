export interface Professional {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalCreateInput {
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export type ProfessionalUpdateInput = Partial<ProfessionalCreateInput>;

export interface ProfessionalFilters {
  search?: string;
  is_active?: boolean;
  per_page?: number;
}

export const PROFESSIONAL_STATUS_OPTIONS: { value: boolean | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];
