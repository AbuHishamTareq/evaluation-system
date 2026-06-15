import { create } from 'zustand';
import type { Category, CategoryCreateInput, CategoryUpdateInput, CategoryFilters } from '../types/classification';
import { apiClient } from '../api/client';

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
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
  filters: CategoryFilters;

  fetchCategories: (params?: { page?: number; per_page?: number; filters?: CategoryFilters }) => Promise<void>;
  fetchCategoryById: (id: number) => Promise<void>;
  createCategory: (data: CategoryCreateInput) => Promise<void>;
  updateCategory: (id: number, data: CategoryUpdateInput) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  fetchActiveCategories: () => Promise<void>;
  setFilters: (filters: CategoryFilters) => void;
  clearError: () => void;
  exportCategories: (format?: string) => Promise<Blob | null>;
  importCategories: (file: File) => Promise<{ success: boolean; message: string }>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
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

  fetchCategories: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set('page', params.page.toString());
      if (params?.per_page) queryParams.set('per_page', params.per_page.toString());
      if (params?.filters?.search) queryParams.set('search', params.filters.search);
      if (params?.filters?.is_active !== undefined) queryParams.set('is_active', params.filters.is_active.toString());

      const response = await apiClient.get<{
        data: Category[];
        meta: { current_page: number; last_page: number; total: number; per_page: number };
      }>(`/api/v1/categories?${queryParams.toString()}`);

      set({
        categories: response.data,
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
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        isLoading: false,
      });
    }
  },

  fetchCategoryById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const category = await apiClient.get<Category>(`/api/v1/categories/${id}`);
      set({ currentCategory: category, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch category',
        isLoading: false,
      });
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.post('/api/v1/categories', data);
      await get().fetchCategories();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to create category');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.put(`/api/v1/categories/${id}`, data);
      await get().fetchCategories();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to update category');
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/v1/categories/${id}`);
      await get().fetchCategories();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete category',
        isLoading: false,
      });
    }
  },

  fetchActiveCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await apiClient.get<Category[]>('/api/v1/categories/active');
      set({ categories, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch active categories',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => set({ filters }),

  clearError: () => set({ error: null }),

  exportCategories: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await apiClient.get('/api/v1/categories/export', {
        params: { format },
        responseType: 'blob',
      });
      set({ isExporting: false });
      return response as unknown as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export categories',
        isExporting: false,
      });
      return null;
    }
  },

  importCategories: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post<{ success: boolean; message: string }>(
        '/api/v1/categories/import',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      await get().fetchCategories();
      set({ isImporting: false });
      return { success: response.success, message: response.message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import categories';
      set({
        error: errorMessage,
        isImporting: false,
      });
      return { success: false, message: errorMessage };
    }
  },
}));
