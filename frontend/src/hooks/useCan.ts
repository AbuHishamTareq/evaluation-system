import { useAuthStore } from '../stores/authStore';

export function useCan(): (permission: string) => boolean {
  return useAuthStore((state) => state.hasPermission);
}
