import { create } from 'zustand';
import type { Field, FieldCreateInput, FieldUpdateInput, FieldFilters } from '../types/classification';
import { apiClient } from '../api/client';

interface FieldState {
  fields: Field[];
  currentField: Field | null;
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
  filters: FieldFilters;

  fetchFields: (params?: { page?: number; per_page?: number; filters?: FieldFilters }) => Promise<void>;
  fetchFieldById: (id: number) => Promise<void>;
  createField: (data: FieldCreateInput) => Promise<void>;
  updateField: (id: number, data: FieldUpdateInput) => Promise<void>;
  deleteField: (id: number) => Promise<void>;
  fetchActiveFields: () => Promise<void>;
  setFilters: (filters: FieldFilters) => void;
  clearError: () => void;
  exportFields: (format?: string) => Promise<Blob | null>;
  importFields: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useFieldStore = create<FieldState>((set, get) => ({
  fields: [],
  currentField: null,
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

  fetchFields: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.is_active !== undefined) queryParams.set('is_active', params.filters.is_active.toString());

      const response = await apiClient.get<{
        data: Field[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
      }>(`/api/v1/fields?${queryParams.toString()}`);

      set({
        fields: response.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch fields',
        isLoading: false,
      });
    }
  },

  fetchFieldById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const field = await apiClient.get<Field>(`/api/v1/fields/${id}`);
      set({ currentField: field, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch field',
        isLoading: false,
      });
    }
  },

  createField: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/fields', data);
      await get().fetchFields();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to create field');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateField: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/fields/${id}`, data);
      await get().fetchFields();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to update field');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteField: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/fields/${id}`);
      await get().fetchFields();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete field',
        isLoading: false,
      });
    }
  },

  fetchActiveFields: async () => {
    set({ isLoading: true, error: null });
    try {
      const fields = await apiClient.get<Field[]>('/api/v1/fields/active');
      set({ fields, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active fields',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportFields: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/fields/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export fields',
        isExporting: false,
      });
      return null;
    }
  },

  importFields: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/fields/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchFields();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import fields';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));
