export type UserRole = 'admin' | 'manager' | 'evaluator' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  employee_id?: string;
  avatar?: string;
  phone?: string;
  is_active: boolean;
  roles?: Array<{ id: number; name: string }>;
  roles_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserCreateInput {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role: UserRole;
  employee_id?: string;
  is_active?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  is_active?: boolean | '';
}