import { create } from 'zustand';
import type { Question } from '../types';
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
  categories: string[];

  fetchQuestions: (params?: { page?: number; per_page?: number; category?: string }) => Promise<void>;
  fetchQuestionById: (id: string | number) => Promise<void>;
  createQuestion: (data: Partial<Question>) => Promise<void>;
  updateQuestion: (id: string | number, data: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string | number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  exportQuestions: () => Promise<void>;
  importQuestions: (file: File) => Promise<void>;
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
  categories: [],

  fetchQuestions: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await questionService.getAll(params);
      set({
        questions: response.data,
        pagination: {
          currentPage: response.current_page,
          totalPages: response.last_page,
          total: response.total,
          perPage: response.per_page,
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

  exportQuestions: async () => {
    set({ isExporting: true, error: null });
    try {
      const response = await questionService.exportQuestions() as unknown as { data: Blob };
      // Create a download link for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `questions_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  clearError: () => set({ error: null }),
}));