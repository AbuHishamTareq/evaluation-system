import { create } from 'zustand';
import type {
  Category,
  ClassificationMapping,
  ClassificationMappingCreateInput,
  ClassificationMappingUpdateInput,
  ClassificationMappingFilters,
  ClassificationResolveInput,
  ClassificationResolveResult,
} from '../types/classification';
import { apiClient } from '../api/client';

interface ClassificationState {
  mappings: ClassificationMapping[];
  currentMapping: ClassificationMapping | null;
  resolveResult: ClassificationResolveResult | null;
  isLoading: boolean;
  isExporting: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  filters: ClassificationMappingFilters;

  fetchMappings: (params?: { page?: number; per_page?: number; filters?: ClassificationMappingFilters }) => Promise<void>;
  fetchMappingById: (id: number) => Promise<void>;
  createMapping: (data: ClassificationMappingCreateInput) => Promise<void>;
  updateMapping: (id: number, data: ClassificationMappingUpdateInput) => Promise<void>;
  deleteMapping: (id: number) => Promise<void>;
  resolveClassification: (data: ClassificationResolveInput) => Promise<ClassificationResolveResult | null>;
  fetchCategory: (data: ClassificationResolveInput) => Promise<Category | null>;
  setFilters: (filters: ClassificationMappingFilters) => void;
  clearError: () => void;
  clearResolveResult: () => void;
  exportClassifications: (format?: string) => Promise<Blob | null>;
  importClassifications: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useClassificationStore = create<ClassificationState>((set, get) => ({
  mappings: [],
  currentMapping: null,
  resolveResult: null,
  isLoading: false,
  isExporting: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },
  filters: {},

  fetchMappings: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.field_id) queryParams.set('field_id', params.filters.field_id.toString());
      if (params?.filters?.specialty_id) queryParams.set('specialty_id', params.filters.specialty_id.toString());
      if (params?.filters?.rank_id) queryParams.set('rank_id', params.filters.rank_id.toString());
      if (params?.filters?.category_id) queryParams.set('category_id', params.filters.category_id.toString());

      const response = await apiClient.get<{
        data: ClassificationMapping[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
      }>(`/api/v1/classifications?${queryParams.toString()}`);

      set({
        mappings: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch classifications',
        isLoading: false,
      });
    }
  },

  fetchMappingById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const mapping = await apiClient.get<ClassificationMapping>(`/api/v1/classifications/${id}`);
      set({ currentMapping: mapping, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch classification',
        isLoading: false,
      });
    }
  },

  createMapping: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/classifications', data);
      await get().fetchMappings();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to create classification');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateMapping: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/classifications/${id}`, data);
      await get().fetchMappings();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to update classification');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteMapping: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/classifications/${id}`);
      await get().fetchMappings();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete classification',
        isLoading: false,
      });
    }
  },

  resolveClassification: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiClient.post<ClassificationResolveResult>('/api/v1/classifications/resolve', data);
      set({ resolveResult: result, isLoading: false });
      return result;
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to resolve classification');
      set({
        resolveResult: { category: null, mapping: null, message },
        isLoading: false,
      });
      return null;
    }
  },

  fetchCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ success: boolean; data: Category | null }>('/api/v1/classifications/category', data);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch category';
      set({ error: message, isLoading: false });
      return null;
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  clearResolveResult: () => set({ resolveResult: null }),

  exportClassifications: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/classifications/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export classifications',
        isExporting: false,
      });
      return null;
    }
  },

  importClassifications: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/classifications/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchMappings();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import classifications';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));
