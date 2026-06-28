import { create } from 'zustand';
import type { Center, CenterCreateInput, CenterFilters } from '../types/center';
import { apiClient } from '../api/client';

// Toast event dispatcher for non-React contexts
const dispatchToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message, type } }));
};

interface CenterState {
  centers: Center[];
  currentCenter: Center | null;
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
  filters: CenterFilters;

  fetchCenters: (params?: { page?: number; per_page?: number; filters?: CenterFilters }) => Promise<void>;
  fetchCenterById: (id: number) => Promise<void>;
  createCenter: (data: CenterCreateInput) => Promise<void>;
  updateCenter: (id: number, data: Partial<Center>) => Promise<void>;
  updateCenterStatus: (id: number, isActive: boolean) => Promise<void>;
  deleteCenter: (id: number) => Promise<void>;
  setFilters: (filters: CenterFilters) => void;
  clearError: () => void;
  exportCenters: (format?: string) => Promise<Blob | null>;
  importCenters: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useCenterStore = create<CenterState>((set, get) => ({
  centers: [],
  currentCenter: null,
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

  fetchCenters: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.zone_id) queryParams.set('zone_id', params.filters.zone_id.toString());
      if (params?.filters?.classification) queryParams.set('classification', params.filters.classification);
      if (params?.filters?.is_active !== undefined) queryParams.set('is_active', params.filters.is_active.toString());

      const response = await apiClient.get<{ data: Center[]; meta: { current_page: number; last_page: number; total: number; per_page: number } }>(
        `/api/v1/centers?${queryParams.toString()}`
      );

      set({
        centers: response.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch centers',
        isLoading: false,
      });
    }
  },

  fetchCenterById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const center = await apiClient.get<Center>(`/api/v1/centers/${id}`);
      set({ currentCenter: center, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch center',
        isLoading: false,
      });
    }
  },

  createCenter: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/centers', data);
      await get().fetchCenters();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create center',
        isLoading: false,
      });
    }
  },

  updateCenter: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/centers/${id}`, data);
      await get().fetchCenters();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update center',
        isLoading: false,
      });
    }
  },

  updateCenterStatus: async (id, isActive) => {
    // Optimistically update the local state first
    const currentCenters = get().centers;
    set({
      centers: currentCenters.map((center) =>
        center.id === id ? { ...center, is_active: isActive } : center
      ),
    });

    // Make the API call in the background
    try {
      await apiClient.patch(`/api/v1/centers/${id}/status`, { is_active: isActive });
    } catch (error) {
      set({ centers: currentCenters });
      dispatchToast('Failed to update center status. Changes reverted.', 'error');
      set({
        error: error instanceof Error ? error.message : 'Failed to update center status',
      });
    }
  },

  deleteCenter: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/centers/${id}`);
      await get().fetchCenters();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete center',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportCenters: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/centers/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export centers',
        isExporting: false,
      });
      return null;
    }
  },

  importCenters: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/centers/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchCenters();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import centers';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));