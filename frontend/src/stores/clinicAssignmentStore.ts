import { create } from 'zustand';
import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type {
  ClinicAssignment,
  ClinicAssignmentCreateInput,
  ClinicAssignmentFilters,
} from '../types/clinicAssignment';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface ClinicAssignmentState {
  assignments: ClinicAssignment[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchAssignments: (params?: { page?: number; per_page?: number; filters?: ClinicAssignmentFilters }) => Promise<void>;
  createAssignment: (data: ClinicAssignmentCreateInput) => Promise<ClinicAssignment>;
  updateAssignment: (id: number, data: Partial<ClinicAssignmentCreateInput>) => Promise<ClinicAssignment>;
  toggleAssignmentStatus: (id: number) => Promise<ClinicAssignment>;
  deleteAssignment: (id: number) => Promise<void>;
  exportAssignments: (format?: string) => Promise<Blob | null>;
  importAssignments: (file: File) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useClinicAssignmentStore = create<ClinicAssignmentState>((set, get) => ({
  assignments: [],
  isLoading: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchAssignments: async (params) => {
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
        data: ClinicAssignment[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.clinicAssignments.list, { params: queryParams });

      set({
        assignments: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch clinic assignments';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createAssignment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ data: ClinicAssignment }>(API_ENDPOINTS.clinicAssignments.store, data);
      await get().fetchAssignments();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create clinic assignment';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateAssignment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ data: ClinicAssignment }>(API_ENDPOINTS.clinicAssignments.update(id), data);
      await get().fetchAssignments();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update clinic assignment';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAssignmentStatus: async (id) => {
    try {
      const response = await apiClient.patch<{ data: ClinicAssignment }>(API_ENDPOINTS.clinicAssignments.toggleStatus(id));
      await get().fetchAssignments();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle clinic assignment status';
      set({ error: message });
      throw error;
    }
  },

  deleteAssignment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(API_ENDPOINTS.clinicAssignments.destroy(id));
      await get().fetchAssignments();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete clinic assignment';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportAssignments: async (format = 'xlsx') => {
    try {
      const blob = await apiClient.get(API_ENDPOINTS.clinicAssignments.export, {
        params: { format },
        responseType: 'blob',
      });
      return blob as Blob;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to export clinic assignments';
      set({ error: message });
      return null;
    }
  },

  importAssignments: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.clinicAssignments.import,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await get().fetchAssignments();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to import clinic assignments';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isImporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
