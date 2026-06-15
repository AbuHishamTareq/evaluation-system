import { create } from 'zustand';
import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type {
  Department,
  DepartmentCreateInput,
  DepartmentFilters,
} from '../types/department';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface DepartmentState {
  departments: Department[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchDepartments: (params?: { page?: number; per_page?: number; filters?: DepartmentFilters }) => Promise<void>;
  createDepartment: (data: DepartmentCreateInput) => Promise<Department>;
  updateDepartment: (id: number, data: Partial<DepartmentCreateInput>) => Promise<Department>;
  toggleDepartmentStatus: (id: number) => Promise<Department>;
  deleteDepartment: (id: number) => Promise<void>;
  exportDepartments: (format?: string) => Promise<Blob | null>;
  importDepartments: (file: File) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useDepartmentStore = create<DepartmentState>((set, get) => ({
  departments: [],
  isLoading: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchDepartments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
      if (params?.filters?.search) queryParams.search = params.filters.search;
      if (params?.filters?.is_active !== undefined) queryParams.is_active = params.filters.is_active;
      if (params?.filters?.center_id !== undefined && params?.filters?.center_id !== null) queryParams.center_id = params.filters.center_id;

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Department[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.departments.list, { params: queryParams });

      set({
        departments: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch departments';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createDepartment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ data: Department }>(API_ENDPOINTS.departments.store, data);
      await get().fetchDepartments();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create department';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateDepartment: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ data: Department }>(API_ENDPOINTS.departments.update(id), data);
      await get().fetchDepartments();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update department';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleDepartmentStatus: async (id) => {
    try {
      const response = await apiClient.patch<{ data: Department }>(API_ENDPOINTS.departments.toggleStatus(id));
      await get().fetchDepartments();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle department status';
      set({ error: message });
      throw error;
    }
  },

  deleteDepartment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(API_ENDPOINTS.departments.destroy(id));
      await get().fetchDepartments();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete department';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportDepartments: async (format = 'xlsx') => {
    try {
      const blob = await apiClient.get(API_ENDPOINTS.departments.export, {
        params: { format },
        responseType: 'blob',
      });
      return blob as Blob;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to export departments';
      set({ error: message });
      return null;
    }
  },

  importDepartments: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.departments.import,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await get().fetchDepartments();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to import departments';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isImporting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
