import { create } from 'zustand';
import type { PhcMedication, PhcMedicationCreateInput } from '../types/medication';
import { apiClient } from '../api/client';

interface PhcMedicationState {
  items: PhcMedication[];
  isLoading: boolean;
  error: string | null;

  fetchByCenter: (phcCenterId: number) => Promise<void>;
  create: (data: PhcMedicationCreateInput) => Promise<void>;
  update: (id: number, data: Partial<PhcMedication>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  clearError: () => void;
}

export const usePhcMedicationStore = create<PhcMedicationState>((set) => ({
  items: [],
  isLoading: false,
  error: null,

  fetchByCenter: async (phcCenterId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<PhcMedication[]>(`/api/v1/phc-medications/by-center/${phcCenterId}`);
      set({ items: Array.isArray(response) ? response : (response as { data: PhcMedication[] }).data ?? [], isLoading: false });
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

  clearError: () => set({ error: null }),
}));
