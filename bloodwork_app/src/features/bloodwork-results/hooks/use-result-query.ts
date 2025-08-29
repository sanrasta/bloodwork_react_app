import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { analysisResultOptions } from '../lib/analysis-job.options';

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
    ...analysisResultOptions('dummy-token', resultId || 'disabled'),
    enabled: !!resultId,
  });
};
