export type QuestionType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating';

export interface QuestionCategory {
  id: number;
  name: string;
  code: string;
  description: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: number;
  category_id: number;
  sub_category_id: number | null;
  question_text: string;
  description: string | null;
  question_type: QuestionType;
  options: QuestionOption[] | null;
  weight: number;
  max_score: number;
  is_required: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  category?: QuestionCategory;
  sub_category?: QuestionSubCategory;
}

export interface QuestionCreateInput {
  question_text: string;
  question_type: QuestionType;
  category_id: number;
  sub_category_id?: number | null;
  description?: string | null;
  options?: QuestionOption[] | null;
  weight?: number;
  max_score?: number;
  is_required?: boolean;
  is_active?: boolean;
}

export interface QuestionUpdateInput extends Partial<QuestionCreateInput> {}

export interface QuestionCategoryCreateInput {
  name: string;
  code: string;
  description?: string;
  order?: number;
  is_active?: boolean;
}

export interface QuestionCategoryFilters {
  search?: string;
  is_active?: boolean;
}

export interface QuestionFilters {
  search?: string;
  category_id?: number;
  type?: QuestionType;
  is_active?: boolean;
}

export interface QuestionSubCategory {
  id: number;
  question_category_id: number;
  name: string;
  code: string;
  description: string | null;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: QuestionCategory;
  questions_count?: number;
}

export interface QuestionSubCategoryCreateInput {
  question_category_id: number;
  name: string;
  code: string;
  description?: string;
  order?: number;
  is_active?: boolean;
}

export interface QuestionSubCategoryFilters {
  search?: string;
  question_category_id?: number;
  is_active?: boolean;
}
