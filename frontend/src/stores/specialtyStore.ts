import { create } from 'zustand';
import type { Specialty, SpecialtyCreateInput, SpecialtyUpdateInput, SpecialtyFilters } from '../types/classification';
import { apiClient } from '../api/client';

interface SpecialtyState {
  specialties: Specialty[];
  currentSpecialty: Specialty | null;
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
  filters: SpecialtyFilters;

  fetchSpecialties: (params?: { page?: number; per_page?: number; filters?: SpecialtyFilters }) => Promise<void>;
  fetchSpecialtyById: (id: number) => Promise<void>;
  createSpecialty: (data: SpecialtyCreateInput) => Promise<void>;
  updateSpecialty: (id: number, data: SpecialtyUpdateInput) => Promise<void>;
  deleteSpecialty: (id: number) => Promise<void>;
  fetchActiveSpecialties: () => Promise<void>;
  fetchSpecialtiesByField: (fieldId: number) => Promise<Specialty[]>;
  setFilters: (filters: SpecialtyFilters) => void;
  clearError: () => void;
  exportSpecialties: (format?: string) => Promise<Blob | null>;
  importSpecialties: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useSpecialtyStore = create<SpecialtyState>((set, get) => ({
  specialties: [],
  currentSpecialty: null,
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

  fetchSpecialties: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.is_active !== undefined) queryParams.set('is_active', params.filters.is_active.toString());
      if (params?.filters?.field_id) queryParams.set('field_id', params.filters.field_id.toString());

      const response = await apiClient.get<{
        data: Specialty[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
      }>(`/api/v1/specialties?${queryParams.toString()}`);

      set({
        specialties: response.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch specialties',
        isLoading: false,
      });
    }
  },

  fetchSpecialtyById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const specialty = await apiClient.get<Specialty>(`/api/v1/specialties/${id}`);
      set({ currentSpecialty: specialty, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch specialty',
        isLoading: false,
      });
    }
  },

  createSpecialty: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/specialties', data);
      await get().fetchSpecialties();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to create specialty');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateSpecialty: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/specialties/${id}`, data);
      await get().fetchSpecialties();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to update specialty');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteSpecialty: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/specialties/${id}`);
      await get().fetchSpecialties();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete specialty',
        isLoading: false,
      });
    }
  },

  fetchActiveSpecialties: async () => {
    set({ isLoading: true, error: null });
    try {
      const specialties = await apiClient.get<Specialty[]>('/api/v1/specialties/active');
      set({ specialties, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active specialties',
        isLoading: false,
      });
    }
  },

  fetchSpecialtiesByField: async (fieldId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ data: Specialty[] }>(`/api/v1/specialties/field/${fieldId}`);
      set({ specialties: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch specialties by field',
        isLoading: false,
      });
      return [];
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportSpecialties: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/specialties/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export specialties',
        isExporting: false,
      });
      return null;
    }
  },

  importSpecialties: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/specialties/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchSpecialties();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import specialties';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));
