import { create } from 'zustand';
import type { QuestionSubCategory, QuestionSubCategoryCreateInput, QuestionSubCategoryFilters } from '../types/question';
import { questionSubCategoryService } from '../api/services';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  total: number;
  perPage: number;
}

interface QuestionSubCategoryState {
  subCategories: QuestionSubCategory[];
  currentSubCategory: QuestionSubCategory | null;
  isLoading: boolean;
  isImporting: boolean;
  isExporting: boolean;
  error: string | null;
  pagination: PaginationInfo;

  fetchSubCategories: (params?: { page?: number; per_page?: number; filters?: QuestionSubCategoryFilters }) => Promise<void>;
  fetchSubCategoryById: (id: number) => Promise<void>;
  createSubCategory: (data: QuestionSubCategoryCreateInput) => Promise<void>;
  updateSubCategory: (id: number, data: Partial<QuestionSubCategoryCreateInput>) => Promise<void>;
  deleteSubCategory: (id: number) => Promise<void>;
  toggleStatus: (id: number) => Promise<void>;
  exportSubCategories: (format?: string) => Promise<Blob | null>;
  importSubCategories: (file: File) => Promise<{ success: boolean; message: string }>;
  downloadSample: () => Promise<Blob | null>;
  clearError: () => void;
}

export const useQuestionSubCategoryStore = create<QuestionSubCategoryState>((set, get) => ({
  subCategories: [],
  currentSubCategory: null,
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

  fetchSubCategories: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const queryParams: Record<string, string | number | boolean> = {};
      if (params?.page) queryParams.page = params.page;
      if (params?.per_page) queryParams.per_page = params.per_page;
      if (params?.filters?.search) queryParams.search = params.filters.search;
      if (params?.filters?.question_category_id !== undefined) queryParams.question_category_id = params.filters.question_category_id;
      if (params?.filters?.is_active !== undefined) queryParams.is_active = params.filters.is_active;

      const response = await questionSubCategoryService.getAll(queryParams);
      set({
        subCategories: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sub-categories';
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSubCategoryById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionSubCategoryService.getById(id);
      set({ currentSubCategory: response, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch sub-category';
      set({ error: message, isLoading: false });
    }
  },

  createSubCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await questionSubCategoryService.create(data);
      await get().fetchSubCategories();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to create sub-category');
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSubCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await questionSubCategoryService.update(id, data);
      await get().fetchSubCategories();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (error instanceof Error ? error.message : 'Failed to update sub-category');
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSubCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await questionSubCategoryService.delete(id);
      await get().fetchSubCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete sub-category';
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  toggleStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await questionSubCategoryService.toggleStatus(id);
      await get().fetchSubCategories();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle status';
      set({ error: message, isLoading: false });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  exportSubCategories: async (format = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const blob = await questionSubCategoryService.exportQuestionSubCategories(format);
      set({ isExporting: false });
      return blob as Blob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export sub-categories';
      set({ error: message, isExporting: false });
      return null;
    }
  },

  importSubCategories: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      const result = await questionSubCategoryService.importQuestionSubCategories(file);
      await get().fetchSubCategories();
      return { success: true, message: result.message || 'Imported successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import sub-categories';
      set({ error: message });
      return { success: false, message };
    } finally {
      set({ isImporting: false });
    }
  },

  downloadSample: async () => {
    try {
      const blob = await questionSubCategoryService.downloadSample();
      return blob as Blob;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download sample';
      set({ error: message });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
