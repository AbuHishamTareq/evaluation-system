import { create } from 'zustand';
import type { Evaluation, EvaluationFilters, EvaluationCreateInput, EvaluationUpdateInput } from '../types/evaluation';
import { evaluationService } from '../api/services';

interface EvaluationState {
  evaluations: Evaluation[];
  currentEvaluation: Evaluation | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    perPage: number;
  };

  fetchEvaluations: (params?: { page?: number; per_page?: number; filters?: EvaluationFilters }) => Promise<void>;
  fetchEvaluationById: (id: number) => Promise<void>;
  createEvaluation: (data: EvaluationCreateInput) => Promise<void>;
  updateEvaluation: (id: number, data: EvaluationUpdateInput) => Promise<void>;
  deleteEvaluation: (id: number) => Promise<void>;
  submitEvaluation: (id: number) => Promise<void>;
  approveEvaluation: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useEvaluationStore = create<EvaluationState>((set, get) => ({
  evaluations: [],
  currentEvaluation: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchEvaluations: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const apiParams: Record<string, unknown> = {
        page: params?.page ?? 1,
        per_page: params?.per_page ?? 15,
      };
      if (params?.filters) {
        if (params.filters.search) apiParams.search = params.filters.search;
        if (params.filters.status) apiParams.status = params.filters.status;
        if (params.filters.staff_id) apiParams.staff_id = params.filters.staff_id;
        if (params.filters.evaluator_id) apiParams.evaluator_id = params.filters.evaluator_id;
        if (params.filters.center_id) apiParams.center_id = params.filters.center_id;
        if (params.filters.template_id) apiParams.template_id = params.filters.template_id;
      }
      const response = await evaluationService.getAll(apiParams);
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

  fetchEvaluationById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const evaluation = await evaluationService.getById(id);
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
      await evaluationService.create(data);
      await get().fetchEvaluations();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create evaluation',
        isLoading: false,
      });
    }
  },

  updateEvaluation: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const evaluation = await evaluationService.update(id, data as unknown as Partial<Evaluation>);
      set({ currentEvaluation: evaluation, isLoading: false });
      await get().fetchEvaluations();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update evaluation',
        isLoading: false,
      });
    }
  },

  deleteEvaluation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await evaluationService.delete(id);
      await get().fetchEvaluations();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete evaluation',
        isLoading: false,
      });
    }
  },

  submitEvaluation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await evaluationService.submit(id);
      await get().fetchEvaluations();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit evaluation',
        isLoading: false,
      });
    }
  },

  approveEvaluation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await evaluationService.approve(id);
      await get().fetchEvaluations();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to approve evaluation',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
