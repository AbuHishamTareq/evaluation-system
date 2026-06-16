import { create } from 'zustand';
import type { Question, QuestionCreateInput, QuestionUpdateInput, QuestionCategory } from '../types';
import { questionService } from '../api/services';

interface QuestionState {
  questions: Question[];
  currentQuestion: Question | null;
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
  stats: {
    activeCount: number;
    inactiveCount: number;
  };
  categories: QuestionCategory[];

  fetchQuestions: (params?: { page?: number; per_page?: number; category_id?: number; sub_category_id?: number; type?: string; search?: string }) => Promise<void>;
  fetchQuestionById: (id: number) => Promise<void>;
  createQuestion: (data: QuestionCreateInput) => Promise<void>;
  updateQuestion: (id: number, data: QuestionUpdateInput) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createCategory: (data: { name: string; code: string; description?: string; order?: number }) => Promise<void>;
  updateCategory: (id: number, data: Partial<{ name: string; code: string; description: string; order: number; is_active: boolean }>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  exportQuestions: (format?: string) => Promise<void>;
  importQuestions: (file: File) => Promise<void>;
  downloadSample: () => Promise<Blob | null>;
  clearError: () => void;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  currentQuestion: null,
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
  stats: {
    activeCount: 0,
    inactiveCount: 0,
  },
  categories: [],

  fetchQuestions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionService.getAll(params) as unknown as { data: Question[]; meta: { current_page: number; last_page: number; total: number; per_page: number; active_count?: number; inactive_count?: number } };
      set({
        questions: response.data,
        pagination: {
          currentPage: response.meta.current_page,
          totalPages: response.meta.last_page,
          total: response.meta.total,
          perPage: response.meta.per_page,
        },
        stats: {
          activeCount: response.meta.active_count ?? 0,
          inactiveCount: response.meta.inactive_count ?? 0,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch questions',
        isLoading: false,
      });
    }
  },

  fetchQuestionById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const question = await questionService.getById(id);
      set({ currentQuestion: question, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch question',
        isLoading: false,
      });
    }
  },

  createQuestion: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await questionService.create(data);
      await get().fetchQuestions();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create question',
        isLoading: false,
      });
    }
  },

  updateQuestion: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await questionService.update(id, data);
      await get().fetchQuestions();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update question',
        isLoading: false,
      });
    }
  },

  deleteQuestion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await questionService.delete(id);
      await get().fetchQuestions();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete question',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await questionService.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  createCategory: async (data) => {
    set({ error: null });
    try {
      await questionService.createCategory(data);
      await get().fetchCategories();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create category',
      });
    }
  },

  updateCategory: async (id, data) => {
    set({ error: null });
    try {
      await questionService.updateCategory(id, data);
      await get().fetchCategories();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update category',
      });
    }
  },

  deleteCategory: async (id) => {
    set({ error: null });
    try {
      await questionService.deleteCategory(id);
      await get().fetchCategories();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  },

  exportQuestions: async (format: string = 'xlsx') => {
    set({ isExporting: true, error: null });
    try {
      const response = await questionService.exportQuestions(format) as unknown as { data: Blob };
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `questions_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      set({ isExporting: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to export questions',
        isExporting: false,
      });
    }
  },

  importQuestions: async (file: File) => {
    set({ isImporting: true, error: null });
    try {
      await questionService.importQuestions(file);
      await get().fetchQuestions();
      set({ isImporting: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to import questions',
        isImporting: false,
      });
    }
  },

  downloadSample: async () => {
    set({ error: null });
    try {
      const blob = await questionService.downloadSample();
      return blob as Blob;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to download sample',
      });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
