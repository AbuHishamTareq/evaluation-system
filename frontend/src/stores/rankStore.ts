import { create } from 'zustand';
import type { Rank, RankCreateInput, RankUpdateInput, RankFilters } from '../types/classification';
import { apiClient } from '../api/client';

interface RankState {
  ranks: Rank[];
  currentRank: Rank | null;
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
  filters: RankFilters;

  fetchRanks: (params?: { page?: number; per_page?: number; filters?: RankFilters }) => Promise<void>;
  fetchRankById: (id: number) => Promise<void>;
  createRank: (data: RankCreateInput) => Promise<void>;
  updateRank: (id: number, data: RankUpdateInput) => Promise<void>;
  deleteRank: (id: number) => Promise<void>;
  fetchActiveRanks: () => Promise<void>;
  setFilters: (filters: RankFilters) => void;
  clearError: () => void;
  exportRanks: (format?: string) => Promise<Blob | null>;
  importRanks: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useRankStore = create<RankState>((set, get) => ({
  ranks: [],
  currentRank: null,
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

  fetchRanks: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.is_active !== undefined) queryParams.set('is_active', params.filters.is_active.toString());

      const response = await apiClient.get<{
        data: Rank[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
      }>(`/api/v1/ranks?${queryParams.toString()}`);

      set({
        ranks: response.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch ranks',
        isLoading: false,
      });
    }
  },

  fetchRankById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const rank = await apiClient.get<Rank>(`/api/v1/ranks/${id}`);
      set({ currentRank: rank, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch rank',
        isLoading: false,
      });
    }
  },

  createRank: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/ranks', data);
      await get().fetchRanks();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to create rank');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateRank: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/ranks/${id}`, data);
      await get().fetchRanks();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to update rank');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteRank: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/ranks/${id}`);
      await get().fetchRanks();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete rank',
        isLoading: false,
      });
    }
  },

  fetchActiveRanks: async () => {
    set({ isLoading: true, error: null });
    try {
      const ranks = await apiClient.get<Rank[]>('/api/v1/ranks/active');
      set({ ranks, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active ranks',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportRanks: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/ranks/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export ranks',
        isExporting: false,
      });
      return null;
    }
  },

  importRanks: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/ranks/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchRanks();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import ranks';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));
