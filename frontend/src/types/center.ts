import type { Zone } from './zone';

export interface Center {
  id: number;
  name: string;
  code: string;
  zone_id: number | null;
  zone?: Zone | null;
  classification: CenterClassification;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  is_active: boolean;
  notes?: string;
  staff_count?: number;
  created_at?: string;
  updated_at?: string;
}

export type CenterClassification = 'primary' | 'secondary' | 'specialized' | 'community';

export interface CenterCreateInput {
  name: string;
  code: string;
  zone_id: number | null;
  classification: CenterClassification;
  address: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  notes?: string;
}

export interface CenterUpdateInput extends Partial<CenterCreateInput> {}

export interface CenterFilters {
  search?: string;
  zone_id?: number | null;
  classification?: CenterClassification;
  is_active?: boolean;
}

export const CENTER_CLASSIFICATION_OPTIONS: { value: CenterClassification; label: string }[] = [
  { value: 'primary', label: 'Primary Health Center' },
  { value: 'secondary', label: 'Secondary Health Center' },
  { value: 'specialized', label: 'Specialized Center' },
  { value: 'community', label: 'Community Health Center' },
];

export const CENTER_CLASSIFICATION_COLORS: Record<CenterClassification, string> = {
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-purple-100 text-purple-800',
  specialized: 'bg-yellow-100 text-yellow-800',
  community: 'bg-green-100 text-green-800',
};