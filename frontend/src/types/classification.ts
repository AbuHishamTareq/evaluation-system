// SHC Classification System Types

export interface Field {
  id: number;
  name: string;
  name_ar?: string | null;
  code?: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FieldCreateInput {
  name: string;
  name_ar?: string | null;
  code?: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export type FieldUpdateInput = Partial<FieldCreateInput>;

export interface FieldFilters {
  search?: string;
  is_active?: boolean;
}

// ─── Specialty ──────────────────────────────────────────────────────────────

export interface Specialty {
  id: number;
  name: string;
  name_ar?: string | null;
  code?: string;
  field_id: number;
  field?: Field | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SpecialtyCreateInput {
  name: string;
  name_ar?: string | null;
  code?: string;
  field_id: number;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export type SpecialtyUpdateInput = Partial<SpecialtyCreateInput>;

export interface SpecialtyFilters {
  search?: string;
  is_active?: boolean;
  field_id?: number | null;
}

// ─── Rank ───────────────────────────────────────────────────────────────────

export interface Rank {
  id: number;
  name: string;
  name_ar?: string | null;
  code?: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RankCreateInput {
  name: string;
  name_ar?: string | null;
  code?: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export type RankUpdateInput = Partial<RankCreateInput>;

export interface RankFilters {
  search?: string;
  is_active?: boolean;
}

// ─── Category ───────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  name_ar?: string | null;
  code: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreateInput {
  name: string;
  name_ar?: string | null;
  code?: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export type CategoryUpdateInput = Partial<CategoryCreateInput>;

export interface CategoryFilters {
  search?: string;
  is_active?: boolean;
}

// ─── Classification Mapping ─────────────────────────────────────────────────

export interface ClassificationMapping {
  id: number;
  field_id: number;
  specialty_id: number;
  rank_id: number;
  category_id: number;
  field?: Field | null;
  specialty?: Specialty | null;
  rank?: Rank | null;
  category?: Category | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClassificationMappingCreateInput {
  field_id: number;
  specialty_id: number;
  rank_id: number;
  category_id: number;
  notes?: string | null;
}

export type ClassificationMappingUpdateInput = Partial<ClassificationMappingCreateInput>;

export interface ClassificationMappingFilters {
  field_id?: number | null;
  specialty_id?: number | null;
  rank_id?: number | null;
  category_id?: number | null;
}

export interface ClassificationResolveInput {
  field_id: number;
  specialty_id: number;
  rank_id: number;
}

export interface ClassificationResolveResult {
  category: Category | null;
  mapping: ClassificationMapping | null;
  message: string;
}

// ─── Status Options ─────────────────────────────────────────────────────────

export const STATUS_OPTIONS: { value: boolean | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' },
];
