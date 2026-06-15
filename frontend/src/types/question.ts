export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer' | 'rating';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'active' | 'draft' | 'archived';

export interface QuestionOption {
  id: string | number;
  text: string;
  is_correct?: boolean;
}

export interface Question {
  id: string | number;
  question: string;
  type: QuestionType;
  category?: string;
  difficulty: QuestionDifficulty;
  status: QuestionStatus;
  options?: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
  points: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuestionCreateInput {
  question: string;
  type: QuestionType;
  category?: string;
  difficulty?: QuestionDifficulty;
  status?: QuestionStatus;
  options?: QuestionOption[];
  correct_answer?: string;
  explanation?: string;
  points?: number;
}

export interface QuestionUpdateInput extends Partial<QuestionCreateInput> {}

export interface QuestionFilters {
  search?: string;
  type?: QuestionType;
  category?: string;
  difficulty?: QuestionDifficulty;
  status?: QuestionStatus;
}