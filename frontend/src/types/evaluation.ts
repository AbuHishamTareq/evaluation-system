export type EvaluationStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export interface EvaluationAnswer {
  id: number;
  evaluation_id: number;
  question_id: number;
  medication_id: number | null;
  answer_text: string | null;
  answer_yes_no: string | null;
  answer_rating: number | null;
  answer_multiple_choice: string | null;
  score: number | null;
  max_score: number | null;
  evidence_path: string | null;
  comment: string | null;
  question?: {
    id: number;
    question_text: string;
    question_type: string;
    options: Record<string, unknown>[] | null;
    max_score: number;
  };
}

export interface EvaluationTemplate {
  id: number;
  name: string;
  description: string | null;
  schedule_type: 'one_time' | 'monthly' | 'quarterly' | 'custom';
  start_date: string | null;
  end_date: string | null;
  total_score: number;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  questions?: Array<{
    id: number;
    template_id: number;
    question_id: number;
    order: number;
    weight: number;
    is_medication_check?: boolean;
    question: {
      id: number;
      question_text: string;
      question_type: string;
      options: Record<string, unknown>[] | null;
      max_score: number;
      category?: {
        id: number;
        name: string;
      };
    };
  }>;
}

export interface Evaluation {
  id: number;
  template_id: number;
  phc_center_id: number;
  staff_id: number | null;
  evaluator_id: number;
  status: EvaluationStatus;
  total_score: number | null;
  max_score: number | null;
  percentage: number | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
  template?: EvaluationTemplate;
  center?: {
    id: number;
    name: string;
    code: string;
  };
  staff?: {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
  evaluator?: {
    id: number;
    name: string;
    email: string;
  };
  answers?: EvaluationAnswer[];
}

export interface EvaluationCreateInput {
  template_id: number;
  phc_center_id: number;
  staff_id?: number | null;
  evaluator_id: number;
  notes?: string;
}

export interface EvaluationUpdateInput {
  answers?: Array<{
    question_id: number;
    medication_id?: number;
    answer_text?: string;
    answer_yes_no?: string;
    answer_rating?: number;
    answer_multiple_choice?: string;
    comment?: string;
  }>;
  notes?: string;
  status?: EvaluationStatus;
}

export interface EvaluationFilters {
  search?: string;
  status?: EvaluationStatus;
  staff_id?: number;
  evaluator_id?: number;
  center_id?: number;
  template_id?: number;
}

export interface TemplateCreateInput {
  name: string;
  description?: string;
  schedule_type?: 'one_time' | 'monthly' | 'quarterly' | 'custom';
  start_date?: string;
  end_date?: string;
  total_score?: number;
  is_active?: boolean;
  questions?: Array<{
    question_id: number;
    weight?: number;
    order?: number;
    is_medication_check?: boolean;
  }>;
  new_questions?: Array<{
    question_text: string;
    question_type: string;
    options?: Array<{ label: string; value: string }> | null;
    description?: string | null;
    weight?: number;
    is_medication_check?: boolean;
  }>;
}

export interface TemplateFilters {
  search?: string;
  is_active?: boolean;
  schedule_type?: string;
}
