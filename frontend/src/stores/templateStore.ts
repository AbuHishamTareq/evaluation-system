import { create } from 'zustand';
import type { EvaluationTemplate, TemplateCreateInput, TemplateFilters } from '../types/evaluation';
import { templateService } from '../api/services';

interface TemplateState {
  templates: EvaluationTemplate[];
  activeTemplates: EvaluationTemplate[];
  currentTemplate: EvaluationTemplate | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };

  fetchTemplates: (params?: { page?: number; per_page?: number; filters?: TemplateFilters }) => Promise<void>;
  fetchTemplateById: (id: number) => Promise<void>;
  fetchActiveTemplates: () => Promise<void>;
  createTemplate: (data: TemplateCreateInput) => Promise<void>;
  updateTemplate: (id: number, data: Partial<TemplateCreateInput>) => Promise<void>;
  deleteTemplate: (id: number) => Promise<void>;
  toggleTemplateStatus: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  activeTemplates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchTemplates: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const apiParams: Record<string, unknown> = {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 15,
      };
      if (params?.filters) {
        if (params.filters.search) apiParams.search = params.filters.search;
        if (params.filters.is_active !== undefined) apiParams.is_active = params.filters.is_active;
        if (params.filters.schedule_type) apiParams.schedule_type = params.filters.schedule_type;
      }
      const response = await templateService.getAll(apiParams);
      set({
        templates: response.data,
        pagination: {
          currentPage: response.current_page,
          totalPages: response.last_page,
          total: response.total,
          perPage: response.per_page,
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

  fetchTemplateById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const template = await templateService.getById(id);
      set({ currentTemplate: template, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch template',
        isLoading: false,
      });
    }
  },

  fetchActiveTemplates: async () => {
    try {
      const templates = await templateService.getActive();
      set({ activeTemplates: templates });
    } catch {
      // Silently fail - active templates are optional
    }
  },

  createTemplate: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await templateService.create(data as unknown as Partial<EvaluationTemplate>);
      await get().fetchTemplates();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create template',
        isLoading: false,
      });
    }
  },

  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await templateService.update(id, data as unknown as Partial<EvaluationTemplate>);
      await get().fetchTemplates();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update template',
        isLoading: false,
      });
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await templateService.delete(id);
      await get().fetchTemplates();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete template',
        isLoading: false,
      });
    }
  },

  toggleTemplateStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await templateService.toggleStatus(id);
      await get().fetchTemplates();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle template status',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
