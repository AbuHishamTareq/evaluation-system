import { create } from 'zustand';
import type { Medication, MedicationCreateInput, MedicationFilters } from '../types/medication';
import { apiClient } from '../api/client';

interface MedicationState {
  medications: Medication[];
  currentMedication: Medication | null;
  isLoading: boolean;
  isImporting: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
    activeCount: number;
    highAlertCount: number;
    categoriesCount: number;
  };
  filters: MedicationFilters;

  fetchMedications: (params?: { page?: number; per_page?: number; filters?: MedicationFilters }) => Promise<void>;
  fetchMedicationById: (id: number) => Promise<void>;
  createMedication: (data: MedicationCreateInput) => Promise<void>;
  updateMedication: (id: number, data: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: number) => Promise<void>;
  setFilters: (filters: MedicationFilters) => void;
  clearError: () => void;
  exportMedications: (format?: string) => Promise<Blob | null>;
  importMedications: (file: File) => Promise<{ success: boolean; message: string }>;
  downloadTemplate: () => Promise<Blob | null>;
}

export const useMedicationStore = create<MedicationState>((set, get) => ({
  medications: [],
  currentMedication: null,
  isLoading: false,
  isImporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
    activeCount: 0,
    highAlertCount: 0,
    categoriesCount: 0,
  },
  filters: {},

  fetchMedications: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const safeParams = { per_page: 10, ...params };
      const queryParams = new URLSearchParams();
      if (safeParams?.page) queryParams.set('page', safeParams.page.toString());
      if (safeParams?.per_page) queryParams.set('per_page', safeParams.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.is_active !== undefined) queryParams.set('is_active', params.filters.is_active.toString());

      const response = await apiClient.get<{ data: Medication[]; meta: { current_page: number; last_page: number; total: number; per_page: number; active_count: number; high_alert_count: number; categories_count: number } }>(
        `/api/v1/medications?${queryParams.toString()}`
      );

      set({
        medications: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
          activeCount: response.meta.active_count,
          highAlertCount: response.meta.high_alert_count,
          categoriesCount: response.meta.categories_count,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch medications',
        isLoading: false,
      });
    }
  },

  fetchMedicationById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const medication = await apiClient.get<Medication>(`/api/v1/medications/${id}`);
      set({ currentMedication: medication, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch medication',
        isLoading: false,
      });
    }
  },

  createMedication: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/medications', data);
      await get().fetchMedications();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create medication',
        isLoading: false,
      });
    }
  },

  updateMedication: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/medications/${id}`, data);
      await get().fetchMedications();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update medication',
        isLoading: false,
      });
    }
  },

  deleteMedication: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/medications/${id}`);
      await get().fetchMedications();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete medication',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportMedications: async (format = 'xlsx') => {
    set({ isImporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/medications/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isImporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export medications',
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
        '/api/v1/medications/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchMedications();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import medications';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },

  downloadTemplate: async (): Promise<Blob | null> => {
    try {
      const response = await apiClient.get('/api/v1/medications/template', {
        responseType: 'blob',
      });
      return response as unknown as Blob;
    } catch {
      return null;
    }
  },
}));
