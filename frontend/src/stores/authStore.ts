import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../api/services';
import apiClient from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  forgotPasswordLoading: boolean;
  forgotPasswordSuccess: boolean;
  forgotPasswordError: string | null;
  permissions: string[];

  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetForgotPasswordState: () => void;
  setPermissions: (perms: string[]) => void;
  hasPermission: (perm: string) => boolean;
  fetchPermissions: () => Promise<void>;
}

const storedUser = (() => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser,
  isAuthenticated: !!storedUser,
  isLoading: false,
  error: null,
  forgotPasswordLoading: false,
  forgotPasswordSuccess: false,
  forgotPasswordError: null,
  permissions: [],

  login: async (email: string, password: string, rememberMe: boolean = false) => {
    set({ error: null });
    try {
      const response = await authService.login({ email, password, remember_me: rememberMe });
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      set({
        user: response.user,
        isAuthenticated: true,
      });
      if (response.user && (response.user as any).permissions) {
        set({ permissions: (response.user as any).permissions });
      } else {
        try {
          const response = await apiClient.get<{ success: boolean; message: string; data: string[] }>(API_ENDPOINTS.auth.permissions);
          const perms = response.data;
          set({ permissions: Array.isArray(perms) ? perms : [] });
        } catch {
          // Permissions endpoint may not exist yet
        }
      }
      return true;
    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({
        error: errorMessage,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_user');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

    if (!token) {
      localStorage.removeItem('auth_user');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
      return;
    }

    try {
      const user = await authService.me();
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      try {
        const response = await apiClient.get<{ success: boolean; message: string; data: string[] }>(API_ENDPOINTS.auth.permissions);
        const perms = response.data;
        set({ permissions: Array.isArray(perms) ? perms : [] });
      } catch {
        // Permissions endpoint may not exist yet
      }
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('auth_token');
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
      });
    }
  },

  clearError: () => set({ error: null }),

  forgotPassword: async (email: string) => {
    set({ forgotPasswordLoading: true, forgotPasswordError: null, forgotPasswordSuccess: false });
    try {
      await authService.forgotPassword(email);
      set({
        forgotPasswordLoading: false,
        forgotPasswordSuccess: true,
      });
      return true;
    } catch (error) {
      let errorMessage = 'Failed to send reset password email. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({
        forgotPasswordLoading: false,
        forgotPasswordError: errorMessage,
      });
      return false;
    }
  },

  resetForgotPasswordState: () => set({
    forgotPasswordLoading: false,
    forgotPasswordSuccess: false,
    forgotPasswordError: null,
  }),

  setPermissions: (perms: string[]) => set({ permissions: perms }),

  hasPermission: (perm: string) => {
    return get().permissions.includes(perm);
  },

  fetchPermissions: async () => {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: string[] }>(API_ENDPOINTS.auth.permissions);
      const perms = response.data;
      set({ permissions: Array.isArray(perms) ? perms : [] });
    } catch {
      // Permissions endpoint may not exist yet
    }
  },
}));