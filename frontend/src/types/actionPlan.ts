export type ActionPlanStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface ActionPlan {
  id: string | number;
  title: string;
  description?: string;
  evaluation_id: string | number;
  assigned_to?: string | number;
  due_date?: string;
  status: ActionPlanStatus;
  priority: 'low' | 'medium' | 'high';
  progress: number;
  created_by?: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface ActionPlanCreateInput {
  title: string;
  description?: string;
  evaluation_id: string | number;
  assigned_to?: string | number;
  due_date?: string;
  status?: ActionPlanStatus;
  priority?: 'low' | 'medium' | 'high';
}

export interface ActionPlanUpdateInput extends Partial<ActionPlanCreateInput> {
  progress?: number;
}

export interface ActionPlanFilters {
  evaluation_id?: string | number;
  assigned_to?: string | number;
  status?: ActionPlanStatus;
  priority?: 'low' | 'medium' | 'high';
}