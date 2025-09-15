import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { bloodworkQueryKeys } from '../lib/query-keys';
import { getResult } from '../api/bloodwork-api';
import type { BloodworkResult } from '../types/types';

/**
 * Hook for querying bloodwork analysis results
 * 
 * Features:
 * - Uses reusable query options for consistency with prefetching
 * - Benefits from prefetched data when coming from completed analysis
 * - Type-safe cache management
 * - Proper error handling and retry logic
 */
export const useResultQuery = (resultId: string | undefined) => {
  const { getToken } = useAuth();
  
  // Always call hooks in the same order
  return useQuery<BloodworkResult, Error, BloodworkResult>({
    queryKey: bloodworkQueryKeys.result(resultId || 'disabled'),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      const resp = await getResult(token, resultId!);
      return resp.data;
    },
    enabled: !!resultId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount) => failureCount < 2,
  });
};
