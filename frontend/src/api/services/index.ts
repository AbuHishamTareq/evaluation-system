import apiClient from '../client';
import API_ENDPOINTS from '../endpoints';

// Types
import type {
  User,
  Staff,
  Question,
  Evaluation,
  EvaluationTemplate,
  Center,
  ActionPlan,
  DashboardStats,
  PaginatedResponse,
  Field,
  Specialty,
  Rank,
  Category,
  ClassificationMapping,
  ClassificationResolveInput,
  ClassificationResolveResult,
  EducationalDegree,
  QuestionCreateInput,
  QuestionUpdateInput,
  QuestionCategory,
  QuestionCategoryCreateInput,
  QuestionSubCategory,
  QuestionSubCategoryCreateInput,
} from '../../types';

// Auth Service
export const authService = {
  login: async (credentials: { email: string; password: string; remember_me?: boolean }) => {
    const response = await apiClient.post<{ success: boolean; message: string; data: { user: User; token: string; remember_me: boolean } }>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    if (response.data?.token) {
      const { token, remember_me, user } = response.data;
      if (remember_me) {
        localStorage.setItem('auth_token', token);
      } else {
        sessionStorage.setItem('auth_token', token);
      }
      apiClient.setToken(token);
      return { user, token, remember_me };
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } finally {
      apiClient.clearToken();
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
    }
  },

  me: async () => {
    const response = await apiClient.get<{ data: User }>(API_ENDPOINTS.auth.me);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.forgotPassword,
      { email }
    );
  },

  resetPassword: async (data: { email: string; token: string; password: string; password_confirmation: string }) => {
    return apiClient.post<{ message: string }>(
      API_ENDPOINTS.auth.resetPassword,
      data
    );
  },
};

// Staff Service
export const staffService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; filters?: Record<string, unknown> }) => {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.page) queryParams.page = params.page;
    if (params?.per_page) queryParams.per_page = params.per_page;
    if (params?.search) queryParams.search = params.search;
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          queryParams[key] = val as string | number | boolean;
        }
      });
    }
    return apiClient.get<{ success: boolean; data: Staff[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(
      API_ENDPOINTS.staff.list,
      { params: queryParams }
    );
  },

  getById: async (id: string | number) => {
    const response = await apiClient.get<{ success: boolean; data: Staff }>(API_ENDPOINTS.staff.show(id));
    return response.data;
  },

  create: async (data: Partial<Staff>) => {
    const response = await apiClient.post<{ success: boolean; data: Staff }>(API_ENDPOINTS.staff.store, data);
    return response.data;
  },

  update: async (id: string | number, data: Partial<Staff>) => {
    const response = await apiClient.put<{ success: boolean; data: Staff }>(API_ENDPOINTS.staff.update(id), data);
    return response.data;
  },

  delete: async (id: string | number) => {
    await apiClient.delete(API_ENDPOINTS.staff.destroy(id));
  },

  toggleStatus: async (id: string | number) => {
    const response = await apiClient.patch<{ success: boolean; data: Staff }>(API_ENDPOINTS.staff.toggleStatus(id));
    return response.data;
  },

  search: async (query: string) => {
    const response = await apiClient.get<{ success: boolean; data: Staff[] }>(API_ENDPOINTS.staff.search, { params: { q: query } });
    return response.data;
  },

  exportStaff: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.staff.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importStaff: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.staff.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.staff.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Question Service
export const questionService = {
  getAll: async (params?: { page?: number; per_page?: number; category_id?: number; sub_category_id?: number; type?: string; search?: string }) => {
    return apiClient.get<PaginatedResponse<Question>>(API_ENDPOINTS.questions.list, { params });
  },

  getById: async (id: number) => {
    return apiClient.get<Question>(API_ENDPOINTS.questions.show(id));
  },

  create: async (data: QuestionCreateInput) => {
    return apiClient.post<Question>(API_ENDPOINTS.questions.store, data);
  },

  update: async (id: number, data: QuestionUpdateInput) => {
    return apiClient.put<Question>(API_ENDPOINTS.questions.update(id), data);
  },

  delete: async (id: number) => {
    return apiClient.delete(API_ENDPOINTS.questions.destroy(id));
  },

  getCategories: async () => {
    const response = await apiClient.get<{ data: QuestionCategory[] }>(API_ENDPOINTS.questions.categories);
    return response.data;
  },

  createCategory: async (data: { name: string; code: string; description?: string; order?: number }) => {
    return apiClient.post<QuestionCategory>(API_ENDPOINTS.questions.storeCategory, data);
  },

  updateCategory: async (id: number, data: Partial<{ name: string; code: string; description: string; order: number; is_active: boolean }>) => {
    return apiClient.put<QuestionCategory>(API_ENDPOINTS.questions.updateCategory(id), data);
  },

  deleteCategory: async (id: number) => {
    return apiClient.delete(API_ENDPOINTS.questions.destroyCategory(id));
  },

  exportQuestions: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.questions.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importQuestions: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.questions.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.questions.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Evaluation Service
export const evaluationService = {
  getAll: async (params?: { page?: number; per_page?: number; status?: string; search?: string; center_id?: number; template_id?: number }) => {
    return apiClient.get<PaginatedResponse<Evaluation>>(API_ENDPOINTS.evaluations.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<Evaluation>(API_ENDPOINTS.evaluations.show(id));
  },

  create: async (data: Partial<Evaluation>) => {
    return apiClient.post<Evaluation>(API_ENDPOINTS.evaluations.store, data);
  },

  update: async (id: string | number, data: Partial<Evaluation>) => {
    return apiClient.put<Evaluation>(API_ENDPOINTS.evaluations.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.evaluations.destroy(id));
  },

  submit: async (id: string | number) => {
    return apiClient.post<Evaluation>(API_ENDPOINTS.evaluations.submit(id));
  },

  approve: async (id: string | number) => {
    return apiClient.post<Evaluation>(API_ENDPOINTS.evaluations.approve(id));
  },
};

// Template Service
export const templateService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean; schedule_type?: string }) => {
    return apiClient.get<PaginatedResponse<EvaluationTemplate>>(API_ENDPOINTS.templates.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<EvaluationTemplate>(API_ENDPOINTS.templates.show(id));
  },

  create: async (data: Partial<EvaluationTemplate>) => {
    return apiClient.post<EvaluationTemplate>(API_ENDPOINTS.templates.store, data);
  },

  update: async (id: string | number, data: Partial<EvaluationTemplate>) => {
    return apiClient.put<EvaluationTemplate>(API_ENDPOINTS.templates.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.templates.destroy(id));
  },

  toggleStatus: async (id: string | number) => {
    return apiClient.patch<EvaluationTemplate>(API_ENDPOINTS.templates.toggleStatus(id));
  },

  getActive: async () => {
    return apiClient.get<EvaluationTemplate[]>(API_ENDPOINTS.templates.active);
  },
};

// Center Service
export const centerService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; zone_id?: number; classification?: string }) => {
    return apiClient.get<PaginatedResponse<Center>>(API_ENDPOINTS.centers.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<Center>(API_ENDPOINTS.centers.show(id));
  },

  create: async (data: Partial<Center>) => {
    return apiClient.post<Center>(API_ENDPOINTS.centers.store, data);
  },

  update: async (id: string | number, data: Partial<Center>) => {
    return apiClient.put<Center>(API_ENDPOINTS.centers.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.centers.destroy(id));
  },

  exportCenters: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.centers.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importCenters: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.centers.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

// Action Plan Service
export const actionPlanService = {
  getAll: async (params?: { page?: number; per_page?: number; evaluation_id?: string | number }) => {
    return apiClient.get<PaginatedResponse<ActionPlan>>(API_ENDPOINTS.actionPlans.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<ActionPlan>(API_ENDPOINTS.actionPlans.show(id));
  },

  create: async (data: Partial<ActionPlan>) => {
    return apiClient.post<ActionPlan>(API_ENDPOINTS.actionPlans.store, data);
  },

  update: async (id: string | number, data: Partial<ActionPlan>) => {
    return apiClient.put<ActionPlan>(API_ENDPOINTS.actionPlans.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.actionPlans.destroy(id));
  },
};

// Reports Service
export const reportsService = {
  getDashboard: async () => {
    return apiClient.get<DashboardStats>(API_ENDPOINTS.reports.dashboard);
  },

  getStaffReport: async (params?: { start_date?: string; end_date?: string }) => {
    return apiClient.get(API_ENDPOINTS.reports.staff, { params });
  },

  getEvaluationReport: async (params?: { start_date?: string; end_date?: string }) => {
    return apiClient.get(API_ENDPOINTS.reports.evaluations, { params });
  },

  getQuestionReport: async () => {
    return apiClient.get(API_ENDPOINTS.reports.questions);
  },

  exportReport: async (type: string, format: string = 'excel') => {
    return apiClient.get(API_ENDPOINTS.reports.export, { params: { type, format } });
  },
};

// Zone Service
export const zoneService = {
  exportZones: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.zones.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importZones: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.zones.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },
};

// ─── SHC Classification Services ────────────────────────────────────────────

// Field Service
export const fieldService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) => {
    return apiClient.get<PaginatedResponse<Field>>(API_ENDPOINTS.fields.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<Field>(API_ENDPOINTS.fields.show(id));
  },

  create: async (data: Partial<Field>) => {
    return apiClient.post<Field>(API_ENDPOINTS.fields.store, data);
  },

  update: async (id: string | number, data: Partial<Field>) => {
    return apiClient.put<Field>(API_ENDPOINTS.fields.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.fields.destroy(id));
  },

  getActive: async () => {
    return apiClient.get<Field[]>(API_ENDPOINTS.fields.active);
  },

  search: async (query: string) => {
    return apiClient.get<Field[]>(API_ENDPOINTS.fields.search, { params: { q: query } });
  },

  exportFields: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.fields.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importFields: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.fields.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.fields.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Specialty Service
export const specialtyService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean; field_id?: number }) => {
    return apiClient.get<PaginatedResponse<Specialty>>(API_ENDPOINTS.specialties.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<Specialty>(API_ENDPOINTS.specialties.show(id));
  },

  create: async (data: Partial<Specialty>) => {
    return apiClient.post<Specialty>(API_ENDPOINTS.specialties.store, data);
  },

  update: async (id: string | number, data: Partial<Specialty>) => {
    return apiClient.put<Specialty>(API_ENDPOINTS.specialties.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.specialties.destroy(id));
  },

  getActive: async () => {
    return apiClient.get<Specialty[]>(API_ENDPOINTS.specialties.active);
  },

  search: async (query: string) => {
    return apiClient.get<Specialty[]>(API_ENDPOINTS.specialties.search, { params: { q: query } });
  },

  getByField: async (fieldId: string | number) => {
    return apiClient.get<Specialty[]>(API_ENDPOINTS.specialties.byField(fieldId));
  },

  exportSpecialties: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.specialties.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importSpecialties: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.specialties.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.specialties.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Rank Service
export const rankService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) => {
    return apiClient.get<PaginatedResponse<Rank>>(API_ENDPOINTS.ranks.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<Rank>(API_ENDPOINTS.ranks.show(id));
  },

  create: async (data: Partial<Rank>) => {
    return apiClient.post<Rank>(API_ENDPOINTS.ranks.store, data);
  },

  update: async (id: string | number, data: Partial<Rank>) => {
    return apiClient.put<Rank>(API_ENDPOINTS.ranks.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.ranks.destroy(id));
  },

  getActive: async () => {
    return apiClient.get<Rank[]>(API_ENDPOINTS.ranks.active);
  },

  search: async (query: string) => {
    return apiClient.get<Rank[]>(API_ENDPOINTS.ranks.search, { params: { q: query } });
  },

  exportRanks: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.ranks.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importRanks: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.ranks.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ranks.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Category Service
export const categoryService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) => {
    return apiClient.get<PaginatedResponse<Category>>(API_ENDPOINTS.categories.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<Category>(API_ENDPOINTS.categories.show(id));
  },

  create: async (data: Partial<Category>) => {
    return apiClient.post<Category>(API_ENDPOINTS.categories.store, data);
  },

  update: async (id: string | number, data: Partial<Category>) => {
    return apiClient.put<Category>(API_ENDPOINTS.categories.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.categories.destroy(id));
  },

  getActive: async () => {
    return apiClient.get<Category[]>(API_ENDPOINTS.categories.active);
  },

  search: async (query: string) => {
    return apiClient.get<Category[]>(API_ENDPOINTS.categories.search, { params: { q: query } });
  },

  exportCategories: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.classificationCategories.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importCategories: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.classificationCategories.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.classificationCategories.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Classification Service
export const classificationService = {
  getAll: async (params?: { page?: number; per_page?: number; field_id?: number; specialty_id?: number; rank_id?: number; category_id?: number }) => {
    return apiClient.get<PaginatedResponse<ClassificationMapping>>(API_ENDPOINTS.classifications.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<ClassificationMapping>(API_ENDPOINTS.classifications.show(id));
  },

  create: async (data: Partial<ClassificationMapping>) => {
    return apiClient.post<ClassificationMapping>(API_ENDPOINTS.classifications.store, data);
  },

  update: async (id: string | number, data: Partial<ClassificationMapping>) => {
    return apiClient.put<ClassificationMapping>(API_ENDPOINTS.classifications.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.classifications.destroy(id));
  },

  resolve: async (data: ClassificationResolveInput) => {
    return apiClient.post<ClassificationResolveResult>(API_ENDPOINTS.classifications.resolve, data);
  },

  exportClassifications: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.classifications.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importClassifications: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.classifications.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.classifications.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Educational Degree Service
export const educationalDegreeService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) => {
    return apiClient.get<PaginatedResponse<EducationalDegree>>(API_ENDPOINTS.educationalDegrees.list, { params });
  },

  getById: async (id: string | number) => {
    return apiClient.get<EducationalDegree>(API_ENDPOINTS.educationalDegrees.show(id));
  },

  create: async (data: Partial<EducationalDegree>) => {
    return apiClient.post<EducationalDegree>(API_ENDPOINTS.educationalDegrees.store, data);
  },

  update: async (id: string | number, data: Partial<EducationalDegree>) => {
    return apiClient.put<EducationalDegree>(API_ENDPOINTS.educationalDegrees.update(id), data);
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.educationalDegrees.destroy(id));
  },

  toggleStatus: async (id: string | number) => {
    return apiClient.patch<EducationalDegree>(API_ENDPOINTS.educationalDegrees.toggleStatus(id));
  },

  getActive: async () => {
    return apiClient.get<EducationalDegree[]>(API_ENDPOINTS.educationalDegrees.active);
  },

  search: async (query: string) => {
    return apiClient.get<EducationalDegree[]>(API_ENDPOINTS.educationalDegrees.search, { params: { q: query } });
  },

  exportEducationalDegrees: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.educationalDegrees.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importEducationalDegrees: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(API_ENDPOINTS.educationalDegrees.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.educationalDegrees.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Question Category Service
export const questionCategoryService = {
  getAll: async (params?: { page?: number; per_page?: number; search?: string; is_active?: boolean }) => {
    const response = await apiClient.get<{
      data: QuestionCategory[];
      meta: { current_page: number; last_page: number; total: number; per_page: number };
    }>(API_ENDPOINTS.questionCategories.list, { params });
    return response;
  },

  getById: async (id: string | number) => {
    const response = await apiClient.get<{ data: QuestionCategory }>(API_ENDPOINTS.questionCategories.show(id));
    return response.data;
  },

  create: async (data: QuestionCategoryCreateInput) => {
    const response = await apiClient.post<{ data: QuestionCategory }>(API_ENDPOINTS.questionCategories.store, data);
    return response.data;
  },

  update: async (id: string | number, data: Partial<QuestionCategoryCreateInput>) => {
    const response = await apiClient.put<{ data: QuestionCategory }>(API_ENDPOINTS.questionCategories.update(id), data);
    return response.data;
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.questionCategories.destroy(id));
  },

  toggleStatus: async (id: string | number) => {
    const response = await apiClient.patch<{ data: QuestionCategory }>(API_ENDPOINTS.questionCategories.toggleStatus(id));
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get<{ data: QuestionCategory[] }>(API_ENDPOINTS.questionCategories.active);
    return response.data;
  },

  exportQuestionCategories: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.questionCategories.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importQuestionCategories: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.questionCategories.import, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.questionCategories.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Question Sub Category Service
export const questionSubCategoryService = {
  getAll: async (params?: Record<string, string | number | boolean>) => {
    const response = await apiClient.get<{
      data: QuestionSubCategory[];
      meta: { current_page: number; last_page: number; total: number; per_page: number };
    }>(API_ENDPOINTS.questionSubCategories.list, { params });
    return response;
  },

  getById: async (id: string | number) => {
    const response = await apiClient.get<{ data: QuestionSubCategory }>(API_ENDPOINTS.questionSubCategories.show(id));
    return response.data;
  },

  create: async (data: QuestionSubCategoryCreateInput) => {
    const response = await apiClient.post<{ data: QuestionSubCategory }>(API_ENDPOINTS.questionSubCategories.store, data);
    return response.data;
  },

  update: async (id: string | number, data: Partial<QuestionSubCategoryCreateInput>) => {
    const response = await apiClient.put<{ data: QuestionSubCategory }>(API_ENDPOINTS.questionSubCategories.update(id), data);
    return response.data;
  },

  delete: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.questionSubCategories.destroy(id));
  },

  toggleStatus: async (id: string | number) => {
    const response = await apiClient.patch<{ data: QuestionSubCategory }>(API_ENDPOINTS.questionSubCategories.toggleStatus(id));
    return response.data;
  },

  getActive: async () => {
    const response = await apiClient.get<{ data: QuestionSubCategory[] }>(API_ENDPOINTS.questionSubCategories.active);
    return response.data;
  },

  exportQuestionSubCategories: async (format: string = 'xlsx') => {
    const response = await apiClient.get(API_ENDPOINTS.questionSubCategories.export, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  importQuestionSubCategories: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.questionSubCategories.import, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  downloadSample: async () => {
    const response = await apiClient.get(API_ENDPOINTS.questionSubCategories.sample, {
      responseType: 'blob',
    });
    return response;
  },
};

// Analytics Service
export const analyticsService = {
  getDashboard: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.dashboard);
  },

  getEvaluationTrends: async (period: string = 'month') => {
    return apiClient.get(API_ENDPOINTS.analytics.evaluationTrends, { params: { period } });
  },

  getTopPerformers: async (limit: number = 10) => {
    return apiClient.get(API_ENDPOINTS.analytics.topPerformers, { params: { limit } });
  },

  getCenterPerformance: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.centerPerformance);
  },

  getQuestionAnalytics: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.questionAnalytics);
  },

  getActionPlanStatistics: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.actionPlanStatistics);
  },

  getScoreDistribution: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.scoreDistribution);
  },

  getZoneAnalytics: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.zoneAnalytics);
  },

  getClassificationBreakdown: async () => {
    return apiClient.get(API_ENDPOINTS.analytics.classificationBreakdown);
  },

  getRecentActivity: async (limit: number = 10) => {
    return apiClient.get(API_ENDPOINTS.analytics.recentActivity, { params: { limit } });
  },

  exportPdf: async () => {
    const response = await apiClient.get(API_ENDPOINTS.analytics.exportPdf, {
      responseType: 'blob',
    });
    return response;
  },

  exportExcel: async () => {
    const response = await apiClient.get(API_ENDPOINTS.analytics.exportExcel, {
      responseType: 'blob',
    });
    return response;
  },
};

export default {
  auth: authService,
  staff: staffService,
  questions: questionService,
  questionCategories: questionCategoryService,
  questionSubCategories: questionSubCategoryService,
  evaluations: evaluationService,
  templates: templateService,
  centers: centerService,
  actionPlans: actionPlanService,
  reports: reportsService,
  zones: zoneService,
  fields: fieldService,
  specialties: specialtyService,
  ranks: rankService,
  categories: categoryService,
  classifications: classificationService,
  educationalDegrees: educationalDegreeService,
  analytics: analyticsService,
};