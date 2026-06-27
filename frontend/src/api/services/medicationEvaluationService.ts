import apiClient from '../client';
import API_ENDPOINTS from '../endpoints';
import type {
  MedicationEvaluationTemplate,
  MedicationEvaluation,
  MedicationEvaluationTemplateFormData,
  MedicationEvaluationTemplateFilters,
  MedicationEvaluationFilters,
  MedicationEvaluationCreateInput,
  MedicationEvaluationUpdateInput,
} from '../../types/medicationEvaluation';
import type { PaginatedResponse } from '../../types';

// ─── Medication Evaluation Template Service ──────────────────────────────────

export const medicationEvaluationTemplateService = {
  getTemplates: async (filters?: MedicationEvaluationTemplateFilters) => {
    const params: Record<string, string | number | boolean> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.is_active !== undefined) params.is_active = filters.is_active;
    if (filters?.page) params.page = filters.page;
    if (filters?.per_page) params.per_page = filters.per_page;
    return apiClient.get<PaginatedResponse<MedicationEvaluationTemplate>>(
      API_ENDPOINTS.medicationEvaluationTemplates.list,
      { params }
    );
  },

  getTemplate: async (id: string | number) => {
    const response = await apiClient.get<{ success: boolean; data: MedicationEvaluationTemplate }>(
      API_ENDPOINTS.medicationEvaluationTemplates.show(id)
    );
    return response.data;
  },

  createTemplate: async (data: MedicationEvaluationTemplateFormData) => {
    const response = await apiClient.post<{ success: boolean; data: MedicationEvaluationTemplate }>(
      API_ENDPOINTS.medicationEvaluationTemplates.store,
      data
    );
    return response.data;
  },

  updateTemplate: async (id: string | number, data: Partial<MedicationEvaluationTemplateFormData>) => {
    const response = await apiClient.put<{ success: boolean; data: MedicationEvaluationTemplate }>(
      API_ENDPOINTS.medicationEvaluationTemplates.update(id),
      data
    );
    return response.data;
  },

  deleteTemplate: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.medicationEvaluationTemplates.destroy(id));
  },
};

// ─── Medication Evaluation Service ───────────────────────────────────────────

export const medicationEvaluationService = {
  getEvaluations: async (filters?: MedicationEvaluationFilters) => {
    const params: Record<string, string | number | boolean> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.status) params.status = filters.status;
    if (filters?.template_id) params.template_id = filters.template_id;
    if (filters?.phc_center_id) params.phc_center_id = filters.phc_center_id;
    if (filters?.evaluator_id) params.evaluator_id = filters.evaluator_id;
    if (filters?.page) params.page = filters.page;
    if (filters?.per_page) params.per_page = filters.per_page;
    return apiClient.get<PaginatedResponse<MedicationEvaluation>>(
      API_ENDPOINTS.medicationEvaluations.list,
      { params }
    );
  },

  getEvaluation: async (id: string | number) => {
    const response = await apiClient.get<{ success: boolean; data: MedicationEvaluation }>(
      API_ENDPOINTS.medicationEvaluations.show(id)
    );
    return response.data;
  },

  createEvaluation: async (data: MedicationEvaluationCreateInput) => {
    const response = await apiClient.post<{ success: boolean; data: MedicationEvaluation }>(
      API_ENDPOINTS.medicationEvaluations.store,
      data
    );
    return response.data;
  },

  updateEvaluation: async (id: string | number, data: MedicationEvaluationUpdateInput) => {
    const response = await apiClient.put<{ success: boolean; data: MedicationEvaluation }>(
      API_ENDPOINTS.medicationEvaluations.update(id),
      data
    );
    return response.data;
  },

  deleteEvaluation: async (id: string | number) => {
    return apiClient.delete(API_ENDPOINTS.medicationEvaluations.destroy(id));
  },
};
