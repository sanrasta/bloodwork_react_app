import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { startAnalysis } from '../api/bloodwork-api';
import { invalidationHelpers } from '../lib/query-keys';
import { reactQueryLogger } from '../../../shared/utils/logger';

/**
 * Hook for starting bloodwork analysis with proper cache management
 * 
 * Features:
 * - Type-safe query key invalidation
 * - Invalidates analysis jobs to trigger refetch of job list
 * - Consistent error handling and logging
 */
export const useStartAnalysis = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  
  return useMutation({
    mutationKey: ['start-analysis'], // Consistent mutation identification
    mutationFn: async (uploadId: string) => {
      // Temporarily bypass auth for testing
      const token = 'dummy-token'; // Backend auth is disabled
      reactQueryLogger.mutation('Starting analysis for upload:', uploadId);
      return startAnalysis(token, uploadId);
    },
    onSuccess: (data) => {
      reactQueryLogger.mutation('Analysis started successfully:', data);
      // Invalidate analysis jobs to refetch the list and show new job
      queryClient.invalidateQueries({ 
        queryKey: invalidationHelpers.invalidateAnalysisJobs() 
      });
      reactQueryLogger.cache('Invalidated analysis jobs after starting new analysis');
    },
    onError: (error) => {
      reactQueryLogger.error('Failed to start analysis:', error);
    },
  });
};
