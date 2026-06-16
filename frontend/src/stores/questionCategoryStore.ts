import { create } from 'zustand';
import type { QuestionCategory, QuestionCategoryCreateInput, QuestionCategoryFilters } from '../types/question';
import { questionCategoryService } from '../api/services';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface QuestionCategoryState {
  categories: QuestionCategory[];
  currentCategory: QuestionCategory | null;
  isLoading: boolean;
  isImporting: boolean;
  isExporting: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchCategories: (params?: { page?: number; per_page?: number; filters?: QuestionCategoryFilters }) => Promise<void>;
  fetchCategoryById: (id: number) => Promise<void>;
  createCategory: (data: QuestionCategoryCreateInput) => Promise<void>;
  updateCategory: (id: number, data: Partial<QuestionCategoryCreateInput>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  toggleStatus: (id: number) => Promise<void>;
  exportCategories: (format?: string) => Promise<Blob | null>;
  importCategories: (file: File) => Promise<{ success: boolean; message: string }>;
  downloadSample: () => Promise<Blob | null>;
  clearError: () => void;
}

export const useQuestionCategoryStore = create<QuestionCategoryState>((set, get) => ({
  categories: [],
  currentCategory: null,
  isLoading: false,
  isImporting: false,
  isExporting: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    perPage: 15,
  },

  fetchCategories: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
      if (params?.filters?.search) queryParams.search = params.filters.search;
      if (params?.filters?.is_active !== undefined) queryParams.is_active = params.filters.is_active;

      const response = await questionCategoryService.getAll(queryParams);
      set({
        categories: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch categories';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategoryById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionCategoryService.getById(id);
      set({ currentCategory: response, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch category';
      set({ error: message, isLoading: false });
    }
  },

  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await questionCategoryService.create(data);
      await get().fetchCategories();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to create category');
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await questionCategoryService.update(id, data);
      await get().fetchCategories();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to update category');
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await questionCategoryService.delete(id);
      await get().fetchCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await questionCategoryService.toggleStatus(id);
      await get().fetchCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle status';
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportCategories: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const blob = await questionCategoryService.exportQuestionCategories(format);
      set({ isExporting: false });
      return blob as Blob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export categories';
      set({ error: message, isExporting: false });
      return null;
    }
  },

  importCategories: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const result = await questionCategoryService.importQuestionCategories(file);
      await get().fetchCategories();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import categories';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isImporting: false });
    }
  },

  downloadSample: async () => {
    try {
      const blob = await questionCategoryService.downloadSample();
      return blob as Blob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download sample';
      set({ error: message });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
