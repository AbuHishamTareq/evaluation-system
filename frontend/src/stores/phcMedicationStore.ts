import { create } from 'zustand';
import type { PhcMedication, PhcMedicationCreateInput } from '../types/medication';
import { apiClient } from '../api/client';

interface PhcMedicationState {
  items: PhcMedication[];
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  extraMeta: {
    total_linked: number;
    total_recommended_qty: number;
    stock_below_recommended: number;
    unique_locations: number;
  };

  fetchByCenter: (phcCenterId: number, page?: number, filters?: { search?: string; allocation_location?: string }) => Promise<void>;
  create: (data: PhcMedicationCreateInput) => Promise<void>;
  update: (id: number, data: Partial<PhcMedication>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  setPage: (page: number) => void;
  clearError: () => void;
  downloadTemplate: () => Promise<Blob | null>;
  importMedications: (file: File) => Promise<{ success: boolean; message: string }>;
  exportMedications: (format?: string) => Promise<Blob | null>;
}

export const usePhcMedicationStore = create<PhcMedicationState>((set) => ({
  items: [],
  isLoading: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 10,
  },
  extraMeta: {
    total_linked: 0,
    total_recommended_qty: 0,
    stock_below_recommended: 0,
    unique_locations: 0,
  },

  fetchByCenter: async (phcCenterId, page = 1, filters?: { search?: string; allocation_location?: string }) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('per_page', '10');
      if (filters?.search) params.set('search', filters.search);
      if (filters?.allocation_location) params.set('allocation_location', filters.allocation_location);
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: PhcMedication[];
        meta: {
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
          total_linked?: number;
          total_recommended_qty?: number;
          stock_below_recommended?: number;
          unique_locations?: number;
        };
      }>(`/api/v1/phc-medications/by-center/${phcCenterId}?${params.toString()}`);
      set({
        items: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
        extraMeta: {
          total_linked: response.meta.total_linked ?? 0,
          total_recommended_qty: response.meta.total_recommended_qty ?? 0,
          stock_below_recommended: response.meta.stock_below_recommended ?? 0,
          unique_locations: response.meta.unique_locations ?? 0,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch PHC medications',
        isLoading: false,
      });
    }
  },

  create: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/phc-medications', data);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to link medication',
        isLoading: false,
      });
    }
  },

  update: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/phc-medications/${id}`, data);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update PHC medication',
        isLoading: false,
      });
    }
  },

  remove: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/phc-medications/${id}`);
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to unlink medication',
        isLoading: false,
      });
    }
  },

  setPage: (page) => set((state) => ({
    pagination: { ...state.pagination, currentPage: page }
  })),

  clearError: () => set({ error: null }),

  downloadTemplate: async (): Promise<Blob | null> => {
    set({ isImporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/phc-medications/template', {
        responseType: 'blob',
      });
      set({ isImporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to download template',
        isImporting: false,
      });
      return null;
    }
  },

  importMedications: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/phc-medications/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import PHC medications';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },

  exportMedications: async (format = 'xlsx'): Promise<Blob | null> => {
    set({ isImporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/phc-medications/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isImporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export PHC medications',
        isImporting: false,
      });
      return null;
    }
  },
}));
