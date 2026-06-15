import { create } from 'zustand';
import type { Zone, ZoneCreateInput, ZoneFilters } from '../types/zone';
import { apiClient } from '../api/client';

interface ZoneState {
  zones: Zone[];
  currentZone: Zone | null;
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
  filters: ZoneFilters;

  fetchZones: (params?: { page?: number; per_page?: number; filters?: ZoneFilters }) => Promise<void>;
  fetchZoneById: (id: number) => Promise<void>;
  createZone: (data: ZoneCreateInput) => Promise<void>;
  updateZone: (id: number, data: Partial<Zone>) => Promise<void>;
  deleteZone: (id: number) => Promise<void>;
  fetchZoneTree: () => Promise<Zone[]>;
  setFilters: (filters: ZoneFilters) => void;
  clearError: () => void;
  exportZones: (format?: string) => Promise<Blob | null>;
  importZones: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useZoneStore = create<ZoneState>((set, get) => ({
  zones: [],
  currentZone: null,
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

  fetchZones: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.level) queryParams.set('level', params.filters.level);
      if (params?.filters?.parent_id) queryParams.set('parent_id', params.filters.parent_id.toString());

      const response = await apiClient.get<{ data: Zone[]; meta: { current_page: number; last_page: number; total: number; per_page: number } }>(
        `/api/v1/zones?${queryParams.toString()}`
      );

      set({
        zones: response.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch zones',
        isLoading: false,
      });
    }
  },

  fetchZoneById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const zone = await apiClient.get<Zone>(`/api/v1/zones/${id}`);
      set({ currentZone: zone, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch zone',
        isLoading: false,
      });
    }
  },

  createZone: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/zones', data);
      await get().fetchZones();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create zone',
        isLoading: false,
      });
    }
  },

  updateZone: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/zones/${id}`, data);
      await get().fetchZones();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update zone',
        isLoading: false,
      });
    }
  },

  deleteZone: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/zones/${id}`);
      await get().fetchZones();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete zone',
        isLoading: false,
      });
    }
  },

  fetchZoneTree: async () => {
    try {
      const tree = await apiClient.get<Zone[]>('/api/v1/zones/tree');
      return tree;
    } catch {
      return [];
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportZones: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/zones/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export zones',
        isExporting: false,
      });
      return null;
    }
  },

  importZones: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/zones/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchZones();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import zones';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));