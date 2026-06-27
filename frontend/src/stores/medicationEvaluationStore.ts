import { create } from 'zustand';
import type {
  MedicationEvaluation,
  MedicationEvaluationFilters,
  MedicationEvaluationCreateInput,
  MedicationEvaluationUpdateInput,
} from '../types/medicationEvaluation';
import { medicationEvaluationService } from '../api/services';

interface MedicationEvaluationState {
  evaluations: MedicationEvaluation[];
  currentEvaluation: MedicationEvaluation | null;
  isLoading: boolean;
  error: string | null;
  filters: MedicationEvaluationFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };

  fetchEvaluations: (params?: { page?: number; per_page?: number; filters?: MedicationEvaluationFilters }) => Promise<void>;
  fetchEvaluation: (id: number) => Promise<void>;
  createEvaluation: (data: MedicationEvaluationCreateInput) => Promise<MedicationEvaluation | null>;
  updateEvaluation: (id: number, data: MedicationEvaluationUpdateInput) => Promise<MedicationEvaluation | null>;
  deleteEvaluation: (id: number) => Promise<void>;
  setFilters: (filters: MedicationEvaluationFilters) => void;
  clearError: () => void;
}

export const useMedicationEvaluationStore = create<MedicationEvaluationState>((set, get) => ({
  evaluations: [],
  currentEvaluation: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchEvaluations: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const apiParams: MedicationEvaluationFilters = {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 15,
        ...get().filters,
        ...params?.filters,
      };
      const response = await medicationEvaluationService.getEvaluations(apiParams);
      set({
        evaluations: response.data,
        pagination: {
          currentPage: response.meta?.current_page ?? 1,
          totalPages: response.meta?.last_page ?? 1,
          total: response.meta?.total ?? 0,
          perPage: response.meta?.per_page ?? 15,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch evaluations',
        isLoading: false,
      });
    }
  },

  fetchEvaluation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const evaluation = await medicationEvaluationService.getEvaluation(id);
      set({ currentEvaluation: evaluation, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch evaluation',
        isLoading: false,
      });
    }
  },

  createEvaluation: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await medicationEvaluationService.createEvaluation(data);
      await get().fetchEvaluations();
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create evaluation',
        isLoading: false,
      });
      return null;
    }
  },

  updateEvaluation: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await medicationEvaluationService.updateEvaluation(id, data);
      set({ currentEvaluation: result, isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update evaluation',
        isLoading: false,
      });
      return null;
    }
  },

  deleteEvaluation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await medicationEvaluationService.deleteEvaluation(id);
      await get().fetchEvaluations();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete evaluation',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),
}));
