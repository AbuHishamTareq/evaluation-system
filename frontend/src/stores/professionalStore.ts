import { create } from 'zustand';
import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type {
  Professional,
  ProfessionalCreateInput,
  ProfessionalFilters,
} from '../types/professional';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface ProfessionalState {
  professionals: Professional[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchProfessionals: (params?: { page?: number; per_page?: number; filters?: ProfessionalFilters }) => Promise<void>;
  createProfessional: (data: ProfessionalCreateInput) => Promise<Professional>;
  updateProfessional: (id: number, data: Partial<ProfessionalCreateInput>) => Promise<Professional>;
  toggleProfessionalStatus: (id: number) => Promise<Professional>;
  deleteProfessional: (id: number) => Promise<void>;
  exportProfessionals: (format?: string) => Promise<Blob | null>;
  importProfessionals: (file: File) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useProfessionalStore = create<ProfessionalState>((set, get) => ({
  professionals: [],
  isLoading: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchProfessionals: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
      if (params?.filters?.search) queryParams.search = params.filters.search;
      if (params?.filters?.is_active !== undefined) queryParams.is_active = params.filters.is_active;

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Professional[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.professionals.list, { params: queryParams });

      set({
        professionals: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch professionals';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createProfessional: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ data: Professional }>(API_ENDPOINTS.professionals.store, data);
      await get().fetchProfessionals();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create professional';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfessional: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ data: Professional }>(API_ENDPOINTS.professionals.update(id), data);
      await get().fetchProfessionals();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update professional';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleProfessionalStatus: async (id) => {
    try {
      const response = await apiClient.patch<{ data: Professional }>(API_ENDPOINTS.professionals.toggleStatus(id));
      await get().fetchProfessionals();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle professional status';
      set({ error: message });
      throw error;
    }
  },

  deleteProfessional: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(API_ENDPOINTS.professionals.destroy(id));
      await get().fetchProfessionals();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete professional';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportProfessionals: async (format = 'xlsx') => {
    try {
      const blob = await apiClient.get(API_ENDPOINTS.professionals.export, {
        params: { format },
        responseType: 'blob',
      });
      return blob as Blob;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to export professionals';
      set({ error: message });
      return null;
    }
  },

  importProfessionals: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.professionals.import,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await get().fetchProfessionals();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to import professionals';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isImporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
