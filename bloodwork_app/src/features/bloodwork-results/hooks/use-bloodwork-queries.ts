import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBloodworkResults, 
  getBloodworkResultById,
  createBloodworkResult,
  updateBloodworkResult,
  deleteBloodworkResult 
} from '../api/bloodwork-api';
import type { BloodworkFilters } from '../types/types';
import type { BloodworkResultInput } from '../schemas/bloodwork-schema';

// Query Keys
export const bloodworkKeys = {
  all: ['bloodwork'] as const,
  lists: () => [...bloodworkKeys.all, 'list'] as const,
  list: (filters?: BloodworkFilters) => [...bloodworkKeys.lists(), { filters }] as const,
  details: () => [...bloodworkKeys.all, 'detail'] as const,
  detail: (id: string) => [...bloodworkKeys.details(), id] as const,
};

// Queries
export const useGetBloodworkResults = (filters?: BloodworkFilters) => {
  return useQuery({
    queryKey: bloodworkKeys.list(filters),
    queryFn: () => getBloodworkResults(filters),
    select: (response) => response.data,
  });
};

export const useGetBloodworkResultById = (id: string) => {
  return useQuery({
    queryKey: bloodworkKeys.detail(id),
    queryFn: () => getBloodworkResultById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Mutations
export const useCreateBloodworkResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BloodworkResultInput) => createBloodworkResult(data),
    onSuccess: () => {
      // Invalidate and refetch bloodwork lists
      queryClient.invalidateQueries({ queryKey: bloodworkKeys.lists() });
    },
  });
};

export const useUpdateBloodworkResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BloodworkResultInput> }) => 
      updateBloodworkResult(id, data),
    onSuccess: (response, variables) => {
      // Update the specific bloodwork result in cache
      queryClient.setQueryData(bloodworkKeys.detail(variables.id), response);
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: bloodworkKeys.lists() });
    },
  });
};

export const useDeleteBloodworkResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteBloodworkResult(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bloodworkKeys.detail(deletedId) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: bloodworkKeys.lists() });
    },
  });
};
