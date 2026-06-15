import { create } from 'zustand';
import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type { Role, Permission, RoleCreateInput, RoleUpdateInput } from '../types/role';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface RoleState {
  roles: Role[];
  permissions: Permission[];
  allPermissions: Permission[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchRoles: (params?: { page?: number; per_page?: number; search?: string }) => Promise<void>;
  fetchRole: (id: number) => Promise<Role | null>;
  fetchPermissions: (params?: { page?: number; per_page?: number }) => Promise<void>;
  fetchAllPermissions: () => Promise<void>;
  createRole: (data: RoleCreateInput) => Promise<Role>;
  updateRole: (id: number, data: RoleUpdateInput) => Promise<Role>;
  deleteRole: (id: number) => Promise<void>;
  syncRolePermissions: (roleId: number, permissionIds: number[]) => Promise<void>;
  getUserRoles: (userId: string | number) => Promise<Role[]>;
  assignUserRoles: (userId: string | number, roleIds: number[]) => Promise<void>;
  clearError: () => void;
}

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  permissions: [],
  allPermissions: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchRoles: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
      if (params?.search) queryParams.search = params.search;

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Role[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.roles.list, { params: queryParams });

      set({
        roles: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch roles';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRole: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Role;
      }>(API_ENDPOINTS.roles.show(id));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch role';
      set({ error: message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPermissions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;

      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: Permission[];
        meta: {
          current_page: number;
          last_page: number;
          per_page: number;
          total: number;
        };
      }>(API_ENDPOINTS.permissions.list, { params: queryParams });

      set({
        permissions: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch permissions';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllPermissions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Permission[];
      }>(API_ENDPOINTS.permissions.list, {
        params: { per_page: 1000 },
      });

      set({ allPermissions: response.data });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch permissions';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  createRole: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ success: boolean; data: Role }>(
        API_ENDPOINTS.roles.store,
        data
      );
      await get().fetchRoles();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create role';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateRole: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ success: boolean; data: Role }>(
        API_ENDPOINTS.roles.update(id),
        data
      );
      await get().fetchRoles();
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update role';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteRole: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(API_ENDPOINTS.roles.destroy(id));
      await get().fetchRoles();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete role';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  syncRolePermissions: async (roleId, permissionIds) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(API_ENDPOINTS.roles.syncPermissions(roleId), {
        permission_ids: permissionIds,
      });
      // Refresh the roles list to get updated permissions
      await get().fetchRoles();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to sync permissions';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getUserRoles: async (userId) => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Role[];
      }>(API_ENDPOINTS.roles.getUserRoles(userId));
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch user roles';
      set({ error: message });
      return [];
    }
  },

  assignUserRoles: async (userId, roleIds) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(API_ENDPOINTS.roles.assignUserRoles(userId), {
        roles: roleIds,
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to assign user roles';
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
