import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/v1/auth/login', { email, password }),
  logout: () => api.post('/v1/auth/logout'),
  me: () => api.get('/v1/auth/me'),
  updateProfile: (data: { name?: string; locale?: string }) =>
    api.put('/v1/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/v1/auth/change-password', { current_password: currentPassword, new_password: newPassword }),
}

export const dashboardApi = {
  getKpiSummary: (params?: { phc_center_id?: number; region_id?: number }) =>
    api.get('/v1/dashboard/kpi-summary', { params }),
  getDrillDown: (entityType: string, entityId: number, breadcrumbs?: { type: string; id: number; label: string }[]) =>
    api.get('/v1/dashboard/drill-down', { params: { entity_type: entityType, entity_id: entityId, breadcrumbs } }),
  getComparative: (params?: { phc_center_id?: number; region_id?: number }) =>
    api.get('/v1/dashboard/comparative', { params }),
  getTrends: (metric: string, days?: number) =>
    api.get('/v1/dashboard/trends', { params: { metric, days } }),
}

export interface CreateStaffData {
  user_id?: number;
  zone_id?: number | null;
  phc_center_id?: number | null;
  department_id?: number | null;
  nationality_id?: number | null;
  employee_id: string;
  first_name: string;
  last_name: string;
  first_name_ar?: string;
  last_name_ar?: string;
  phone?: string;
  email?: string;
  national_id?: string;
  gender?: string;
  birth_date?: string;
  hire_date?: string;
  employment_status?: string;
  shc_category_id?: number | null;
  scfhs_license?: string;
  scfhs_license_expiry?: string;
  malpractice_insurance?: string;
  malpractice_expiry?: string;
  certifications?: string;
  education?: string;
}

export type UpdateStaffData = Partial<CreateStaffData>

export const staffApi = {
  getAll: (params?: { page?: number; per_page?: number; search?: string; status?: string; department_id?: number }) =>
    api.get('/v1/staff-profiles', { params }),
  getById: (id: number) => api.get(`/v1/staff-profiles/${id}`),
  create: (data: CreateStaffData) => api.post('/v1/staff-profiles', data),
  update: (id: number, data: UpdateStaffData) => api.put(`/v1/staff-profiles/${id}`, data),
  delete: (id: number) => api.delete(`/v1/staff-profiles/${id}`),
  deleteBulk: (ids: number[]) => api.post('/v1/staff-profiles/bulk-delete', { ids }),
  updateStatusBulk: (ids: number[], status: 'active' | 'suspended' | 'on_leave' | 'terminated') =>
    api.post('/v1/staff-profiles/bulk-update-status', { ids, status }),
  toggleStatus: (id: number) => api.patch(`/v1/staff-profiles/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  getNextEmployeeId: () => api.get('/v1/staff-profiles/next-id'),
  uploadPhoto: (id: number, formData: FormData) =>
    api.post(`/v1/staff-profiles/${id}/photo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadCertificate: (id: number, formData: FormData) =>
    api.post(`/v1/staff-profiles/${id}/certificate`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getEducations: (id: number) => api.get(`/v1/staff-profiles/${id}/educations`),
  addEducation: (id: number, data: { school_name: string; degree: string; field_of_study?: string; gpa?: number; start_date?: string; graduation_date?: string; notes?: string }) =>
    api.post(`/v1/staff-profiles/${id}/educations`, data),
  updateEducation: (id: number, educationId: number, data: { school_name?: string; degree?: string; field_of_study?: string; gpa?: number; start_date?: string; graduation_date?: string; notes?: string }) =>
    api.put(`/v1/staff-profiles/${id}/educations/${educationId}`, data),
  deleteEducation: (id: number, educationId: number) =>
    api.delete(`/v1/staff-profiles/${id}/educations/${educationId}`),
  getCertificates: (id: number) => api.get(`/v1/staff-profiles/${id}/certificates`),
  addCertificate: (id: number, data: { institute_name: string; certificate_name: string; certificate_type?: string; issue_date?: string; expiry_date?: string; notes?: string }) =>
    api.post(`/v1/staff-profiles/${id}/certificates`, data),
  updateCertificate: (id: number, certificateId: number, data: { institute_name?: string; certificate_name?: string; certificate_type?: string; issue_date?: string; expiry_date?: string; notes?: string }) =>
    api.put(`/v1/staff-profiles/${id}/certificates/${certificateId}`, data),
  deleteCertificate: (id: number, certificateId: number) =>
    api.delete(`/v1/staff-profiles/${id}/certificates/${certificateId}`),
  getExperiences: (id: number) => api.get(`/v1/staff-profiles/${id}/experiences`),
  addExperience: (id: number, data: { company_name: string; position: string; start_date?: string; end_date?: string; is_current?: boolean; responsibilities?: string }) =>
    api.post(`/v1/staff-profiles/${id}/experiences`, data),
  updateExperience: (id: number, experienceId: number, data: { company_name?: string; position?: string; start_date?: string; end_date?: string; is_current?: boolean; responsibilities?: string }) =>
    api.put(`/v1/staff-profiles/${id}/experiences/${experienceId}`, data),
  deleteExperience: (id: number, experienceId: number) =>
    api.delete(`/v1/staff-profiles/${id}/experiences/${experienceId}`),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/staff-profiles/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { status?: string; department_id?: number }) =>
    api.get('/v1/staff-profiles/export', { params: { ...params, format }, responseType: 'blob' }),
  downloadTemplate: (format: 'csv' | 'excel' = 'csv') =>
    api.get('/v1/staff-profiles/template', { params: { format }, responseType: 'blob' }),
}

export interface CreateDepartmentData {
  phc_center_id: number
  name: string
  name_ar?: string
  code: string
  is_active?: boolean
}

export type UpdateDepartmentData = Partial<CreateDepartmentData>

export const departmentApi = {
  getAll: (params?: { phc_center_id?: number; is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/departments', { params }),
  getById: (id: number) => api.get(`/v1/departments/${id}`),
  create: (data: CreateDepartmentData) => api.post('/v1/departments', data),
  update: (id: number, data: UpdateDepartmentData) => api.put(`/v1/departments/${id}`, data),
  delete: (id: number) => api.delete(`/v1/departments/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/departments/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/departments/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/departments/export', { params: { ...params, format }, responseType: 'blob' }),
}

export interface CreateZoneData {
  name: string
  name_ar?: string
  code: string
  is_active?: boolean
}

export type UpdateZoneData = Partial<CreateZoneData>

export const zoneApi = {
  getAll: (params?: { is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/zones', { params }),
  getById: (id: number) => api.get(`/v1/zones/${id}`),
  create: (data: CreateZoneData) => api.post('/v1/zones', data),
  update: (id: number, data: UpdateZoneData) => api.put(`/v1/zones/${id}`, data),
  delete: (id: number) => api.delete(`/v1/zones/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/zones/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/zones/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/zones/export', { params: { ...params, format }, responseType: 'blob' }),
}

export interface CreatePhcCenterData {
  name: string
  name_ar?: string
  code: string
  address?: string
  phone?: string
  region_id?: number
  is_active?: boolean
}

export interface UpdatePhcCenterData extends Partial<CreatePhcCenterData> {}

export const phcCenterApi = {
  getAll: (params?: { region_id?: number | string; is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/phc-centers', { params }),
  getById: (id: number) => api.get(`/v1/phc-centers/${id}`),
  create: (data: CreatePhcCenterData) => api.post('/v1/phc-centers', data),
  update: (id: number, data: UpdatePhcCenterData) => api.put(`/v1/phc-centers/${id}`, data),
  delete: (id: number) => api.delete(`/v1/phc-centers/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/phc-centers/${id}/toggle-status`),
  importFile: (file: File, _format?: any) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/phc-centers/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  import: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/phc-centers/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  export: (params?: { ids?: string; format?: string }) => api.get('/v1/phc-centers/export', { params: { ...params, responseType: 'blob' } }),
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/phc-centers/export', { params: { ...params, format }, responseType: 'blob' }),
  getAssignedTeamBasedCodes: (phcCenterId: number) =>
    api.get(`/v1/phc-centers/${phcCenterId}/team-based-codes/assigned`),
  getAvailableTeamBasedCodes: (phcCenterId: number, params?: { is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get(`/v1/phc-centers/${phcCenterId}/team-based-codes/available`, { params }),
  assignTeamBasedCode: (phcCenterId: number, teamBasedCodeId: number) =>
    api.post(`/v1/phc-centers/${phcCenterId}/team-based-codes/assign`, { team_based_code_ids: [teamBasedCodeId] }),
  removeTeamBasedCode: (phcCenterId: number, teamBasedCodeId: number) =>
    api.delete(`/v1/phc-centers/${phcCenterId}/team-based-codes/${teamBasedCodeId}`),
  removeTeamBasedCodes: (phcCenterId: number, teamBasedCodeIds: number[]) =>
    api.delete(`/v1/phc-centers/${phcCenterId}/team-based-codes`, { data: { team_based_code_ids: teamBasedCodeIds } }),
}

export interface CreateNationalityData {
  name: string
  name_ar?: string
  code?: string
  is_active?: boolean
}

export type UpdateNationalityData = Partial<CreateNationalityData>

export const nationalityApi = {
  getAll: (params?: { is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/nationalities', { params }),
  getById: (id: number) => api.get(`/v1/nationalities/${id}`),
  create: (data: CreateNationalityData) => api.post('/v1/nationalities', data),
  update: (id: number, data: UpdateNationalityData) => api.put(`/v1/nationalities/${id}`, data),
  delete: (id: number) => api.delete(`/v1/nationalities/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/nationalities/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/specialties/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/nationalities/export', { params: { ...params, format }, responseType: 'blob' }),
}

export interface CreateMedicalFieldData {
  name: string
  name_ar?: string
  code?: string
  is_active?: boolean
}

export type UpdateMedicalFieldData = Partial<CreateMedicalFieldData>

export const medicalFieldApi = {
  getAll: (params?: { is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/medical-fields', { params }),
  getById: (id: number) => api.get(`/v1/medical-fields/${id}`),
  create: (data: CreateMedicalFieldData) => api.post('/v1/medical-fields', data),
  update: (id: number, data: UpdateMedicalFieldData) => api.put(`/v1/medical-fields/${id}`, data),
  delete: (id: number) => api.delete(`/v1/medical-fields/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/medical-fields/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/medical-fields/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/medical-fields/export', { params: { ...params, format }, responseType: 'blob' }),
}

export interface CreateSpecialtyData {
  medical_field_id?: number
  name: string
  name_ar?: string
  code?: string
  is_active?: boolean
}

export type UpdateSpecialtyData = Partial<CreateSpecialtyData>

export const specialtyApi = {
  getAll: (params?: { medical_field_id?: number; is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/specialties', { params }),
  getById: (id: number) => api.get(`/v1/specialties/${id}`),
  create: (data: CreateSpecialtyData) => api.post('/v1/specialties', data),
  update: (id: number, data: UpdateSpecialtyData) => api.put(`/v1/specialties/${id}`, data),
  delete: (id: number) => api.delete(`/v1/specialties/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/specialties/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/specialties/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/specialties/export', { params: { ...params, format }, responseType: 'blob' }),
}

export interface CreateRankData {
  name: string
  name_ar?: string
  code?: string
  level?: number
  is_active?: boolean
}

export type UpdateRankData = Partial<CreateRankData>

export const rankApi = {
  getAll: (params?: { is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/ranks', { params }),
  getById: (id: number) => api.get(`/v1/ranks/${id}`),
  create: (data: CreateRankData) => api.post('/v1/ranks', data),
  update: (id: number, data: UpdateRankData) => api.put(`/v1/ranks/${id}`, data),
  delete: (id: number) => api.delete(`/v1/ranks/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/ranks/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/ranks/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/ranks/export', { params: { ...params, format }, responseType: 'blob' }),
}

export interface CreateShcCategoryData {
  medical_field_id?: number
  specialty_id?: number
  rank_id?: number
  code: string
  description?: string
  description_ar?: string
  is_active?: boolean
}

export type UpdateShcCategoryData = Partial<CreateShcCategoryData>

export const shcCategoryApi = {
  getAll: (params?: { medical_field_id?: number; specialty_id?: number; rank_id?: number; is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/shc-categories', { params }),
  getById: (id: number) => api.get(`/v1/shc-categories/${id}`),
  create: (data: CreateShcCategoryData) => api.post('/v1/shc-categories', data),
  update: (id: number, data: UpdateShcCategoryData) => api.put(`/v1/shc-categories/${id}`, data),
  delete: (id: number) => api.delete(`/v1/shc-categories/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/shc-categories/${id}/toggle-status`, {}, { headers: { 'Content-Type': 'application/json' } }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/shc-categories/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/shc-categories/export', { params: { ...params, format }, responseType: 'blob' }),
}

export interface CreateIncidentData {
  type: string;
  severity: string;
  title: string;
  description: string;
}

export type UpdateIncidentData = Partial<CreateIncidentData>

export const incidentApi = {
  getAll: (params?: { page?: number; status?: string; type?: string }) =>
    api.get('/v1/incident-reports', { params }),
  getDashboard: () => api.get('/v1/incident-reports/dashboard'),
  create: (data: CreateIncidentData) => api.post('/v1/incident-reports', data),
  update: (id: number, data: UpdateIncidentData) => api.put(`/v1/incident-reports/${id}`, data),
}

export interface CreateIssueData {
  title: string;
  description: string;
  priority: string;
}

export const issueApi = {
  getAll: (params?: { page?: number; status?: string; priority?: string }) =>
    api.get('/v1/issues', { params }),
  getDashboard: () => api.get('/v1/issues/dashboard'),
  create: (data: CreateIssueData) => api.post('/v1/issues', data),
  addComment: (id: number, comment: string) =>
    api.post(`/v1/issues/${id}/comments`, { comment }),
}

export const medicationApi = {
  getAll: (params?: { page?: number; search?: string }) =>
    api.get('/v1/medications', { params }),
  getBatches: (params?: { medication_id?: number; phc_center_id?: number }) =>
    api.get('/v1/medication-batches', { params }),
  getAlerts: () => api.get('/v1/medication-alerts'),
}

export const shiftApi = {
  getAll: (params?: { page?: number; date?: string }) =>
    api.get('/v1/shifts', { params }),
}

export const regionApi = {
  getAll: () => api.get('/v1/regions'),
}

export const roleApi = {
  getAll: (params?: { page?: number; per_page?: number; search?: string }) =>
    api.get('/v1/roles', { params }),
  getById: (id: number) => api.get(`/v1/roles/${id}`),
  create: (data: { name: string; name_ar?: string; description?: string; permissions?: number[] }) =>
    api.post('/v1/roles', data),
  update: (id: number, data: { name?: string; name_ar?: string; description?: string; permissions?: number[] }) =>
    api.put(`/v1/roles/${id}`, data),
  delete: (id: number) => api.delete(`/v1/roles/${id}`),
  getPermissions: () => api.get('/v1/roles/permissions'),
}

export const userApi = {
  getAll: (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) =>
    api.get('/v1/users', { params }),
  getById: (id: number) => api.get(`/v1/users/${id}`),
  create: (data: { name: string; email: string; password: string; role_id?: number }) =>
    api.post('/v1/users', data),
  update: (id: number, data: { name?: string; email?: string; is_active?: boolean }) =>
    api.put(`/v1/users/${id}`, data),
  destroy: (id: number) => api.delete(`/v1/users/${id}`),
  assignRole: (userId: number, roleId: number) =>
    api.post(`/v1/users/${userId}/assign-role`, { role_id: roleId }),
  removeRole: (userId: number, roleId: number) =>
    api.post(`/v1/users/${userId}/remove-role`, { role_id: roleId }),
  syncRoles: (userId: number, roleIds: number[]) =>
    api.post(`/v1/users/${userId}/sync-roles`, { role_ids: roleIds }),
  getAvailableRoles: () => api.get('/v1/users/roles'),
}

export interface CreateTeamBasedCodeData {
  code: string
  role: string
  is_active?: boolean
}

export type UpdateTeamBasedCodeData = Partial<CreateTeamBasedCodeData>

export const teamBasedCodeApi = {
  getAll: (params?: { is_active?: boolean | string; search?: string; page?: number; per_page?: number }) =>
    api.get('/v1/team-based-codes', { params }),
  getById: (id: number) => api.get(`/v1/team-based-codes/${id}`),
  create: (data: CreateTeamBasedCodeData) => api.post('/v1/team-based-codes', data),
  update: (id: number, data: UpdateTeamBasedCodeData) => api.put(`/v1/team-based-codes/${id}`, data),
  delete: (id: number) => api.delete(`/v1/team-based-codes/${id}`),
  toggleStatus: (id: number) => api.patch(`/v1/team-based-codes/${id}/toggle-status`),
  export: (params?: { ids?: string; format?: string }) => api.get('/v1/team-based-codes/export', { params: { ...params, responseType: 'blob' } }),
  exportFile: (format: 'csv' | 'excel' | 'pdf' = 'csv', params?: { ids?: string }) =>
    api.get('/v1/team-based-codes/export', { params: { ...params, format }, responseType: 'blob' }),
  importFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/v1/team-based-codes/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
}