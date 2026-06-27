import { create } from 'zustand';
import type {
  MedicationEvaluationTemplate,
  MedicationEvaluationTemplateFormData,
  MedicationEvaluationTemplateFilters,
} from '../types/medicationEvaluation';
import { medicationEvaluationTemplateService } from '../api/services';

interface MedicationEvaluationTemplateState {
  templates: MedicationEvaluationTemplate[];
  currentTemplate: MedicationEvaluationTemplate | null;
  isLoading: boolean;
  error: string | null;
  filters: MedicationEvaluationTemplateFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };

  fetchTemplates: (params?: { page?: number; per_page?: number; filters?: MedicationEvaluationTemplateFilters }) => Promise<void>;
  fetchTemplate: (id: number) => Promise<void>;
  createTemplate: (data: MedicationEvaluationTemplateFormData) => Promise<MedicationEvaluationTemplate | null>;
  updateTemplate: (id: number, data: Partial<MedicationEvaluationTemplateFormData>) => Promise<MedicationEvaluationTemplate | null>;
  deleteTemplate: (id: number) => Promise<void>;
  toggleTemplateStatus: (id: number) => Promise<void>;
  setFilters: (filters: MedicationEvaluationTemplateFilters) => void;
  clearError: () => void;
}

export const useMedicationEvaluationTemplateStore = create<MedicationEvaluationTemplateState>((set, get) => ({
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchTemplates: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const apiParams: MedicationEvaluationTemplateFilters = {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 15,
        ...get().filters,
        ...params?.filters,
      };
      const response = await medicationEvaluationTemplateService.getTemplates(apiParams);
      set({
        templates: response.data,
        pagination: {
          currentPage: response.meta?.current_page ?? 1,
          totalPages: response.meta?.last_page ?? 1,
          total: response.meta?.total ?? 0,
          perPage: response.meta?.per_page ?? 15,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        isLoading: false,
      });
    }
  },

  fetchTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const template = await medicationEvaluationTemplateService.getTemplate(id);
      set({ currentTemplate: template, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch template',
        isLoading: false,
      });
    }
  },

  createTemplate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await medicationEvaluationTemplateService.createTemplate(data);
      await get().fetchTemplates();
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create template',
        isLoading: false,
      });
      return null;
    }
  },

  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await medicationEvaluationTemplateService.updateTemplate(id, data);
      set({ currentTemplate: result, isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update template',
        isLoading: false,
      });
      return null;
    }
  },

  toggleTemplateStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const template = get().templates.find((t) => t.id === id) ?? get().currentTemplate;
      if (!template) return;
      await medicationEvaluationTemplateService.updateTemplate(id, { is_active: !template.is_active });
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, is_active: !t.is_active } : t
        ),
        currentTemplate: state.currentTemplate?.id === id
          ? { ...state.currentTemplate, is_active: !state.currentTemplate.is_active }
          : state.currentTemplate,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle template status',
        isLoading: false,
      });
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await medicationEvaluationTemplateService.deleteTemplate(id);
      await get().fetchTemplates();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete template',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),
}));
