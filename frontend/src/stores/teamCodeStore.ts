import { create } from 'zustand';
import type { TeamCode, TeamCodeCreateInput, TeamCodeUpdateInput, TeamCodeFilters, TeamCodeStatistics } from '../types/teamCode';
import { apiClient } from '../api/client';

interface TeamCodeState {
  teamCodes: TeamCode[];
  currentTeamCode: TeamCode | null;
  statistics: TeamCodeStatistics | null;
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
  filters: TeamCodeFilters;

  fetchTeamCodes: (params?: { page?: number; per_page?: number; filters?: TeamCodeFilters }) => Promise<void>;
  fetchTeamCodeById: (id: number) => Promise<void>;
  createTeamCode: (data: TeamCodeCreateInput) => Promise<void>;
  updateTeamCode: (id: number, data: TeamCodeUpdateInput) => Promise<void>;
  updateTeamCodeStatus: (id: number, isActive: boolean) => Promise<void>;
  toggleTeamCodeStatus: (id: number) => Promise<void>;
  deleteTeamCode: (id: number) => Promise<void>;
  fetchStatistics: (id: number) => Promise<void>;
  setFilters: (filters: TeamCodeFilters) => void;
  clearError: () => void;
  exportTeamCodes: (format?: string) => Promise<Blob | null>;
  importTeamCodes: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useTeamCodeStore = create<TeamCodeState>((set, get) => ({
  teamCodes: [],
  currentTeamCode: null,
  statistics: null,
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

  fetchTeamCodes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.center_id) queryParams.set('center_id', params.filters.center_id.toString());
      if (params?.filters?.is_active !== undefined) queryParams.set('is_active', params.filters.is_active.toString());

      const response = await apiClient.get<{ data: TeamCode[]; meta: { current_page: number; last_page: number; total: number; per_page: number } }>(
        `/api/v1/team-codes?${queryParams.toString()}`
      );

      set({
        teamCodes: response.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch team codes',
        isLoading: false,
      });
    }
  },

  fetchTeamCodeById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const teamCode = await apiClient.get<TeamCode>(`/api/v1/team-codes/${id}`);
      set({ currentTeamCode: teamCode, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch team code',
        isLoading: false,
      });
    }
  },

  createTeamCode: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/team-codes', data);
      await get().fetchTeamCodes();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create team code',
        isLoading: false,
      });
    }
  },

  updateTeamCode: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/team-codes/${id}`, data);
      await get().fetchTeamCodes();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update team code',
        isLoading: false,
      });
    }
  },

  updateTeamCodeStatus: async (id, isActive) => {
    const currentTeamCodes = get().teamCodes;
    set({
      teamCodes: currentTeamCodes.map((teamCode) =>
        teamCode.id === id ? { ...teamCode, is_active: isActive } : teamCode
      ),
    });

    try {
      await apiClient.patch(`/api/v1/team-codes/${id}`, { is_active: isActive });
    } catch (error) {
      set({ teamCodes: currentTeamCodes });
      set({
        error: error instanceof Error ? error.message : 'Failed to update team code status',
      });
    }
  },

  toggleTeamCodeStatus: async (id) => {
    const currentTeamCodes = get().teamCodes;
    set({
      teamCodes: currentTeamCodes.map((teamCode) =>
        teamCode.id === id ? { ...teamCode, is_active: !teamCode.is_active } : teamCode
      ),
    });

    try {
      await apiClient.patch(`/api/v1/team-codes/${id}/toggle-status`);
    } catch (error) {
      set({ teamCodes: currentTeamCodes });
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle team code status',
      });
    }
  },

  deleteTeamCode: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/team-codes/${id}`);
      await get().fetchTeamCodes();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete team code',
        isLoading: false,
      });
    }
  },

  fetchStatistics: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const statistics = await apiClient.get<TeamCodeStatistics>(`/api/v1/team-codes/${id}/statistics`);
      set({ statistics, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportTeamCodes: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/team-codes/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export team codes',
        isExporting: false,
      });
      return null;
    }
  },

  importTeamCodes: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/team-codes/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchTeamCodes();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import team codes';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));
