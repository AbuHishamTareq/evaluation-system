import { create } from 'zustand';
import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type { User, UserCreateInput, UserFilters } from '../types/user';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchUsers: (params?: { page?: number; per_page?: number; filters?: UserFilters }) => Promise<void>;
  fetchUser: (id: number) => Promise<User>;
  createUser: (data: UserCreateInput) => Promise<User>;
  updateUser: (id: number, data: Partial<UserCreateInput>) => Promise<User>;
  updateUserStatus: (id: number, isActive?: boolean) => Promise<User>;
  deleteUser: (id: number) => Promise<void>;
  exportUsers: (format?: string) => Promise<Blob | null>;
  importUsers: (file: File) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 100,
  },

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
      if (params?.filters?.search) queryParams.search = params.filters.search;
      if (params?.filters?.role) queryParams.role = params.filters.role;
      if (params?.filters?.is_active !== undefined && params.filters.is_active !== '') {
        queryParams.is_active = params.filters.is_active;
      }

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: User[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.users.list, { params: queryParams });

      set({
        users: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch users';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ success: boolean; data: User }>(
        API_ENDPOINTS.users.show(id)
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch user';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ success: boolean; data: User }>(
        API_ENDPOINTS.users.store,
        data
      );
      await get().fetchUsers();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create user';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ success: boolean; data: User }>(
        API_ENDPOINTS.users.update(id),
        data
      );
      await get().fetchUsers();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update user';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserStatus: async (id, isActive) => {
    try {
      const response = await apiClient.patch<{ success: boolean; data: User }>(
        API_ENDPOINTS.users.toggleActive(id),
        { is_active: isActive }
      );
      await get().fetchUsers();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle user status';
      set({ error: message });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(API_ENDPOINTS.users.destroy(id));
      await get().fetchUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete user';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportUsers: async (format = 'xlsx') => {
    try {
      const blob = await apiClient.get(API_ENDPOINTS.users.export, {
        params: { format },
        responseType: 'blob',
      });
      return blob as Blob;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to export users';
      set({ error: message });
      return null;
    }
  },

  importUsers: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.users.import,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      await get().fetchUsers();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to import users';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
