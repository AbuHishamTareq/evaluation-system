import { create } from 'zustand';
import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type {
  Staff,
  StaffCreateInput,
  StaffFilters,
} from '../types/staff';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface StaffState {
  staff: Staff[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchStaff: (params?: { page?: number; per_page?: number; filters?: StaffFilters }) => Promise<void>;
  createStaff: (data: StaffCreateInput) => Promise<Staff>;
  updateStaff: (id: number, data: Partial<StaffCreateInput>) => Promise<Staff>;
  toggleStaffStatus: (id: number, data?: { deactivation_reason?: string; deactivation_notes?: string }) => Promise<Staff>;
  deleteStaff: (id: number) => Promise<void>;
  exportStaff: (format?: string) => Promise<Blob | null>;
  downloadSample: () => Promise<Blob | null>;
  importStaff: (file: File) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  isLoading: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchStaff: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
      if (params?.filters?.search) queryParams.search = params.filters.search;
      if (params?.filters?.is_active !== undefined) queryParams.is_active = params.filters.is_active;
      if (params?.filters?.status) queryParams.status = params.filters.status;
      if (params?.filters?.department) queryParams.department = params.filters.department;
      if (params?.filters?.employment_type) queryParams.employment_type = params.filters.employment_type;

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Staff[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.staff.list, { params: queryParams });

      set({
        staff: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch staff';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createStaff: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ success: boolean; data: Staff }>(API_ENDPOINTS.staff.store, data);
      await get().fetchStaff();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create staff member';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateStaff: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ success: boolean; data: Staff }>(API_ENDPOINTS.staff.update(id), data);
      await get().fetchStaff();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update staff member';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleStaffStatus: async (id, data) => {
    try {
      const response = await apiClient.patch<{ success: boolean; data: Staff }>(
        API_ENDPOINTS.staff.toggleStatus(id),
        data ?? {}
      );
      await get().fetchStaff();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle staff status';
      set({ error: message });
      throw error;
    }
  },

  deleteStaff: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(API_ENDPOINTS.staff.destroy(id));
      await get().fetchStaff();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete staff member';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportStaff: async (format = 'xlsx') => {
    try {
      const blob = await apiClient.get(API_ENDPOINTS.staff.export, {
        params: { format },
        responseType: 'blob',
      });
      return blob as Blob;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to export staff';
      set({ error: message });
      return null;
    }
  },

  downloadSample: async () => {
    try {
      const blob = await apiClient.get(API_ENDPOINTS.staff.sample, {
        responseType: 'blob',
      });
      return blob as Blob;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to download sample template';
      set({ error: message });
      return null;
    }
  },

  importStaff: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.staff.import,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await get().fetchStaff();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to import staff';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isImporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
