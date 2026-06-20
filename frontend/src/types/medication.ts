import type { Center } from './center';

export interface Medication {
  id: number;
  name: string;
  strength: string | null;
  form: string | null;
  unit: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  phc_medications_count?: number;
}

export interface MedicationCreateInput {
  name: string;
  strength?: string | null;
  form?: string | null;
  unit?: string | null;
  category?: string | null;
  is_active?: boolean;
}

export interface MedicationFilters {
  search?: string;
  is_active?: boolean;
}

export interface PhcMedication {
  id: number;
  phc_center_id: number;
  medication_id: number;
  recommended_quantity: number;
  current_stock: number | null;
  allocation_location: string | null;
  notes: string | null;
  is_active: boolean;
  phc_center?: Center;
  medication?: Medication;
}

export interface PhcMedicationCreateInput {
  phc_center_id: number;
  medication_id: number;
  recommended_quantity: number;
  current_stock?: number | null;
  allocation_location?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface PhcMedicationFilters {
  phc_center_id?: number;
  medication_id?: number;
  is_active?: boolean;
}
