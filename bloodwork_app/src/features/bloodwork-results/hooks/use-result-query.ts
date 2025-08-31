import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { analysisResultOptions } from '../lib/analysis-job.options';
import { bloodworkQueryKeys } from '../lib/query-keys';

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
  return useQuery({
    queryKey: bloodworkQueryKeys.result(resultId || 'disabled'),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      return analysisResultOptions(token, resultId || 'disabled').queryFn();
    },
    enabled: !!resultId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (failureCount) => failureCount < 2,
  });
};
