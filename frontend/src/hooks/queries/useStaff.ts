import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '../../api/services';
import type { StaffCreateInput } from '../../types/staff';

const STAFF_KEYS = {
  all: ['staff'] as const,
  list: (params?: Record<string, unknown>) => ['staff', 'list', params] as const,
  detail: (id: number) => ['staff', 'detail', id] as const,
};

export function useStaffList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: STAFF_KEYS.list(params),
    queryFn: () => staffService.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useStaffDetail(id: number) {
  return useQuery({
    queryKey: STAFF_KEYS.detail(id),
    queryFn: () => staffService.getById(id),
    enabled: !!id,
  });
}

export function useCreateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffCreateInput) => staffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.all });
    },
  });
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => staffService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.all });
    },
  });
}

export function useDeleteStaffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => staffService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STAFF_KEYS.all });
    },
  });
}

export { STAFF_KEYS };
