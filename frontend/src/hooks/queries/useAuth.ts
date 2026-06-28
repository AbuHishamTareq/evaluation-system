import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/services';
import { useAuthStore } from '../../stores/authStore';

const AUTH_KEYS = {
  me: ['auth', 'me'] as const,
  permissions: ['auth', 'permissions'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: () => authService.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: AUTH_KEYS.permissions,
    queryFn: async () => {
      const response = await fetch('/api/v1/auth/permissions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      });
      const data = await response.json();
      return data.data as string[];
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: ({ email, password, rememberMe }: { email: string; password: string; rememberMe?: boolean }) =>
      login(email, password, rememberMe),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
