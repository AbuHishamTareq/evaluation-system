export interface Staff {
  id: number;
  employee_id: string;
  staff_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  gender: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  national_id: string | null;
  address: string | null;
  notes: string | null;
  department_id: number | null;
  professional_id: number | null;
  clinic_assignment_id: number | null;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'volunteer';
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  hire_date: string | null;
  termination_date: string | null;
  scfhs_registration_no: string | null;
  scfhs_issue_date: string | null;
  scfhs_expiry_date: string | null;
  malpractice_insurance_no: string | null;
  malpractice_issue_date: string | null;
  malpractice_expiry_date: string | null;
  phc_center_id: number | null;
  team_code_id?: number | null;
  team_code?: {
    id: number;
    code: string;
    role: string | null;
  } | null;
  photo_path: string | null;
  center?: {
    id: number;
    name: string;
    code: string;
    zone_id: number | null;
  };
  department?: {
    id: number;
    name: string;
  } | null;
  clinic_assignment?: {
    id: number;
    name: string;
  } | null;
  professional?: {
    id: number;
    name: string;
  } | null;
  photo_url: string | null;
  field_id: number | null;
  specialty_id: number | null;
  rank_id: number | null;
  classification_category_id: number | null;
  documents?: Array<{
    id: number;
    name: string;
    url: string;
    file_type: string | null;
    file_size: number | null;
  }>;
  is_active: boolean;
  is_care_provider: boolean;
  deactivation_reason: string | null;
  deactivation_notes: string | null;
  latest_deactivation: {
    id: number;
    staff_id: number;
    deactivation_reason: string;
    deactivation_notes: string | null;
    deactivated_at: string;
    reactivated_at: string | null;
    reactivation_notes: string | null;
  } | null;
  created_at: string;
  updated_at: string;
  educational_degrees?: Array<{
    id: number;
    name: string;
    pivot: {
      staff_id: number;
      educational_degree_id: number;
      institution: string | null;
      year_obtained: number | null;
    };
  }>;
  experiences?: Array<{
    id: number;
    company: string;
    position: string | null;
    from_date: string;
    to_date: string | null;
    description: string | null;
    is_current: boolean;
  }>;
  certifications?: Array<{
    id: number;
    name: string;
    issuing_organization: string | null;
    issue_date: string;
    expiry_date: string | null;
    credential_id: string | null;
  }>;
}

export interface StaffCreateInput {
  employee_id?: string;
  staff_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  national_id?: string | null;
  address?: string | null;
  notes?: string | null;
  department_id?: number | null;
  professional_id?: number | null;
  clinic_assignment_id?: number | null;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'temporary';
  status?: 'active' | 'inactive' | 'suspended' | 'terminated';
  hire_date?: string | null;
  termination_date?: string | null;
  scfhs_registration_no?: string | null;
  scfhs_issue_date?: string | null;
  scfhs_expiry_date?: string | null;
  malpractice_insurance_no?: string | null;
  malpractice_issue_date?: string | null;
  malpractice_expiry_date?: string | null;
  phc_center_id?: number | null;
  team_code_id?: number | null;
  is_active?: boolean;
  is_care_provider?: boolean;
}

export type StaffUpdateInput = Partial<StaffCreateInput>;

export interface StaffFormData extends StaffCreateInput {
  selectedDegrees: Array<{ educational_degree_id: number | null; degree_field: string; gpa_type: 'point' | 'percentage'; gpa_value: string; institution: string; year_obtained: number | null }>;
  experiences: Array<{ company: string; position: string; from_date: string; to_date: string | null; description: string; is_current: boolean }>;
  certificates: Array<{ name: string; issuing_organization: string; issue_date: string; expiry_date: string | null; credential_id: string }>;
  classification: { field_id: number | null; specialty_id: number | null; rank_id: number | null; category_id: number | null };
  photo: File | null;
  documents: File[];
}

export interface StaffFilters {
  search?: string;
  is_active?: boolean;
  status?: string;
  department?: string;
  employment_type?: string;
  per_page?: number;
}

export interface DeactivationRecord {
  id: number;
  staff_id: number;
  deactivation_reason: string;
  deactivation_notes: string | null;
  deactivated_at: string;
  reactivated_at: string | null;
  reactivation_notes: string | null;
}

export const STAFF_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' },
];

export const STAFF_EMPLOYMENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'volunteer', label: 'Volunteer' },
];
