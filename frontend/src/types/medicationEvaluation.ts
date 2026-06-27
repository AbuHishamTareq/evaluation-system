export interface MedicationEvaluationTemplate {
  id: number
  name: string
  description: string | null
  is_active: boolean
  medications: MedicationEvaluationTemplateMedication[]
  criteria: MedicationEvaluationTemplateCriterion[]
  created_at: string
  updated_at: string
}

export interface MedicationEvaluationTemplateMedication {
  id: number
  template_id: number
  medication_id: number
  medication: {
    id: number
    name: string
    strength: string
    form: string
    unit: string
  }
  recommended_quantity: number
  allocation_location: string | null
  order: number
}

export interface MedicationEvaluationTemplateCriterion {
  id: number
  template_id: number
  name: string
  description: string | null
  type: 'number' | 'yes_no' | 'text' | 'yes_no_partial'
  weight: number
  order: number
}

export interface MedicationEvaluation {
  id: number
  template_id: number
  phc_center_id: number
  evaluator_id: number
  status: 'draft' | 'in_progress' | 'completed'
  total_score: number | null
  max_score: number | null
  percentage: number | null
  started_at: string | null
  completed_at: string | null
  notes: string | null
  template: MedicationEvaluationTemplate
  phc_center: { id: number; name: string }
  evaluator: { id: number; name: string }
  answers: MedicationEvaluationAnswer[]
  created_at: string
  updated_at: string
}

export interface MedicationEvaluationAnswer {
  id: number
  evaluation_id: number
  template_medication_id: number
  criterion_id: number
  answer_value: string | null
  score: number | null
  max_score: number | null
  comment: string | null
  template_medication: MedicationEvaluationTemplateMedication
  criterion: MedicationEvaluationTemplateCriterion
}

export interface MedicationEvaluationTemplateFormData {
  name: string
  description: string
  is_active: boolean
  medications?: {
    medication_id: number
    recommended_quantity: number
    allocation_location: string
  }[]
  criteria: {
    name: string
    description: string
    type: 'number' | 'yes_no' | 'text' | 'yes_no_partial'
    weight: number
    order: number
  }[]
}

export interface MedicationEvaluationFilters {
  template_id?: number
  phc_center_id?: number
  evaluator_id?: number
  status?: string
  page?: number
  per_page?: number
  search?: string
}

export interface MedicationEvaluationTemplateFilters {
  search?: string
  is_active?: boolean
  page?: number
  per_page?: number
}

export interface MedicationEvaluationCreateInput {
  template_id: number
  phc_center_id: number
  evaluator_id: number
  notes?: string
}

export interface MedicationEvaluationUpdateInput {
  status?: 'draft' | 'in_progress' | 'completed'
  notes?: string
  answers?: {
    template_medication_id: number
    criterion_id: number
    answer_value: string | null
    comment?: string
  }[]
}
