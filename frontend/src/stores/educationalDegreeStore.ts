import { create } from 'zustand';
import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type {
  EducationalDegree,
  EducationalDegreeCreateInput,
  EducationalDegreeFilters,
} from '../types/educationalDegree';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface EducationalDegreeState {
  educationalDegrees: EducationalDegree[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchEducationalDegrees: (params?: { page?: number; per_page?: number; filters?: EducationalDegreeFilters }) => Promise<void>;
  createEducationalDegree: (data: EducationalDegreeCreateInput) => Promise<EducationalDegree>;
  updateEducationalDegree: (id: number, data: Partial<EducationalDegreeCreateInput>) => Promise<EducationalDegree>;
  toggleEducationalDegreeStatus: (id: number) => Promise<EducationalDegree>;
  deleteEducationalDegree: (id: number) => Promise<void>;
  exportEducationalDegrees: (format?: string) => Promise<Blob | null>;
  importEducationalDegrees: (file: File) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useEducationalDegreeStore = create<EducationalDegreeState>((set, get) => ({
  educationalDegrees: [],
  isLoading: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchEducationalDegrees: async (params) => {
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
        data: EducationalDegree[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.educationalDegrees.list, { params: queryParams });

      set({
        educationalDegrees: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch educational degrees';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createEducationalDegree: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ data: EducationalDegree }>(API_ENDPOINTS.educationalDegrees.store, data);
      await get().fetchEducationalDegrees();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create educational degree';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEducationalDegree: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ data: EducationalDegree }>(API_ENDPOINTS.educationalDegrees.update(id), data);
      await get().fetchEducationalDegrees();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update educational degree';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleEducationalDegreeStatus: async (id) => {
    try {
      const response = await apiClient.patch<{ data: EducationalDegree }>(API_ENDPOINTS.educationalDegrees.toggleStatus(id));
      await get().fetchEducationalDegrees();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle educational degree status';
      set({ error: message });
      throw error;
    }
  },

  deleteEducationalDegree: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(API_ENDPOINTS.educationalDegrees.destroy(id));
      await get().fetchEducationalDegrees();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete educational degree';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportEducationalDegrees: async (format = 'xlsx') => {
    try {
      const blob = await apiClient.get(API_ENDPOINTS.educationalDegrees.export, {
        params: { format },
        responseType: 'blob',
      });
      return blob as Blob;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to export educational degrees';
      set({ error: message });
      return null;
    }
  },

  importEducationalDegrees: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.educationalDegrees.import,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await get().fetchEducationalDegrees();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to import educational degrees';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isImporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
