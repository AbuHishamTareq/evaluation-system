export interface Role {
  id: number;
  name: string;
  description: string | null;
  guard_name: string;
  permissions?: Permission[];
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface RoleCreateInput {
  name: string;
  description?: string | null;
}

export interface RoleUpdateInput extends Partial<RoleCreateInput> {}
