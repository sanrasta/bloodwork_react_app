import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { useEffect, useRef } from 'react';
import { analysisJobOptions, analysisResultOptions } from '../lib/analysis-job.options';
import { bloodworkQueryKeys } from '../lib/query-keys';
import { reactQueryLogger } from '../../../shared/utils/logger';
import { getAnalysisJob, getResult } from '../api/bloodwork-api';

// Global set to track active prefetches and prevent duplicates
const activePrefetches = new Set<string>();

/**
 * Hook for querying analysis job status with smart polling and result prefetching
 * - Consistent retry logic for mobile networks
 */

export const useAnalysisJob = (jobId: string | undefined) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const prefetchedResults = useRef(new Set<string>());
  
  const query = useQuery({
    queryKey: bloodworkQueryKeys.analysisJob(jobId || 'disabled'),
    queryFn: async () => {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      reactQueryLogger.polling('Polling job status for:', jobId);
      const result = await getAnalysisJob(token, jobId || 'disabled');
      reactQueryLogger.polling('Job status:', result.data.status, 'Progress:', result.data.progress);
      return result.data;
    },
    enabled: !!jobId,
    // Copy other options from analysisJobOptions
    refetchInterval: (query) => {
      const { data, error, status } = query.state;
      
      if (error || status === 'error') {
        reactQueryLogger.error('Stopping poll due to error:', error?.message);
        return false;
      }
      
      const isActiveJob = data?.status === 'running' || data?.status === 'queued';
      const isInitialLoad = status === 'pending' && !data;
      
      if (isActiveJob || isInitialLoad) {
        reactQueryLogger.polling('Continuing to poll - query status:', status, 'job status:', data?.status || 'loading');
        return 2000;
      } else {
        reactQueryLogger.polling('Stopping poll - final status:', data?.status || 'unknown');
        return false;
      }
    },
    staleTime: 5_000,
    retry: (failureCount, error) => {
      reactQueryLogger.error('Retry attempt:', failureCount, 'Error:', error.message);
      const errorStatus = 'status' in error ? (error.status as number) : undefined;
      if (errorStatus === 401 || errorStatus === 403) {
        reactQueryLogger.error('Authentication error - not retrying');
        return false;
      }
      if (errorStatus && typeof errorStatus === 'number' && errorStatus >= 500) {
        return failureCount < 5;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    gcTime: 5 * 60 * 1000,
  });
  
  // Prefetch results when job completes 
  useEffect(() => {
    if (!jobId) return; // Early return is safe in useEffect
    const job = query.data;
    
    if (job?.status === 'completed' && job.resultId) {
      
      const resultQueryKey = bloodworkQueryKeys.result(job.resultId);
      const existingData = queryClient.getQueryData(resultQueryKey);
      
      if (existingData) {
        reactQueryLogger.cache('Result already cached, skipping prefetch for:', job.resultId);
        return;
      }
      
      if (activePrefetches.has(job.resultId)) {
        reactQueryLogger.cache('Prefetch already in progress, skipping for:', job.resultId);
        return;
      }
      
      if (prefetchedResults.current.has(job.resultId)) {
        reactQueryLogger.cache('Already prefetched from this hook, skipping for:', job.resultId);
        return;
      }
      
      reactQueryLogger.cache('Job completed, prefetching result:', job.resultId);
      
      // Mark as active to prevent duplicates
      activePrefetches.add(job.resultId);
      prefetchedResults.current.add(job.resultId);
      
      // Prefetch the result for instant "View Results" experience
      queryClient.prefetchQuery({
        queryKey: bloodworkQueryKeys.result(job.resultId),
        queryFn: async () => {
          const token = await getToken();
          if (!token) {
            throw new Error('Authentication required');
          }
          reactQueryLogger.polling('Fetching analysis result for:', job.resultId);
          const result = await getResult(token, job.resultId!);
          return result.data;
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
      })
        .then(() => {
          reactQueryLogger.cache('Result prefetched successfully for:', job.resultId);
        })
        .catch((error) => {
          reactQueryLogger.error('Failed to prefetch result:', error);
        })
        .finally(() => {
          // Clean up to allow future prefetches if cache expires
          if (job.resultId) {
            activePrefetches.delete(job.resultId);
          }
        });
    }
  }, [query.data?.status, query.data?.resultId, queryClient]);
  
  // Cleanup on unmount
  useEffect(() => {
    const currentPrefetched = prefetchedResults.current;
    return () => {
      // Clean up any active prefetches for this hook instance
      currentPrefetched.forEach((resultId) => {
        activePrefetches.delete(resultId);
      });
      currentPrefetched.clear();
    };
  }, []);
  
  return query;
};
