import { queryOptions } from '@tanstack/react-query';
import { getAnalysisJob, getResult } from '../api/bloodwork-api';
import { bloodworkQueryKeys } from './query-keys';
import { reactQueryLogger } from '../../../shared/utils/logger';

/**
 * Reusable Query Options for Analysis Jobs
 * 
 * Benefits:
 * - Consistent configuration across useQuery, useSuspenseQuery, prefetchQuery
 * - Smart polling that stops when job is no longer running (battery optimization)
 * - Proper error handling and retry logic for mobile networks
 * - Type-safe query key management
 */

export const analysisJobOptions = (token: string, jobId: string) =>
  queryOptions({
    queryKey: bloodworkQueryKeys.analysisJob(jobId),
    queryFn: async () => {
      reactQueryLogger.polling('Polling job status for:', jobId);
      const result = await getAnalysisJob(token, jobId);
      reactQueryLogger.polling('Job status:', result.data.status, 'Progress:', result.data.progress);
      return result.data; // Return the unwrapped data directly
    },
    // Smart polling: stop when job is no longer running
    refetchInterval: (query) => {
      const { data, error, status } = query.state;
      
      // Don't poll if query is in error state (avoid hammering failing endpoint)
      if (error || status === 'error') {
        reactQueryLogger.error('Stopping poll due to error:', error?.message);
        return false;
      }
      
      // Poll while loading (first fetch) or when job is actively running
      const isActiveJob = data?.status === 'running' || data?.status === 'queued';
      const isInitialLoad = status === 'pending' && !data;
      
      if (isActiveJob || isInitialLoad) {
        reactQueryLogger.polling('Continuing to poll - query status:', status, 'job status:', data?.status || 'loading');
        return 2000; // Poll every 2 seconds while active
      } else {
        reactQueryLogger.polling('Stopping poll - final status:', data?.status || 'unknown');
        return false; // Stop polling when completed/failed
      }
    },
    // Reduce refetch storms on focus/reconnect
    staleTime: 5_000, // 5 seconds
    // Smarter retry logic for mobile networks
    retry: (failureCount, error) => {
      reactQueryLogger.error('Retry attempt:', failureCount, 'Error:', error.message);
      
      // Type-safe error status checking
      const errorStatus = 'status' in error ? (error.status as number) : undefined;
      
      // Don't retry auth errors (401/403) - they won't fix themselves
      if (errorStatus === 401 || errorStatus === 403) {
        reactQueryLogger.error('Authentication error - not retrying');
        return false;
      }
      
      // Retry server errors (5xx) more times - they might recover
      if (errorStatus && typeof errorStatus === 'number' && errorStatus >= 500) {
        return failureCount < 5;
      }
      
      // Limited retries for client errors (4xx) and network issues
      return failureCount < 3;
    },
    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Keep data fresh but not overly aggressive
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

/**
 * Query options for analysis results
 * Used for prefetching when job completes and in useResultQuery
 */
export const analysisResultOptions = (token: string, resultId: string) =>
  queryOptions({
    queryKey: bloodworkQueryKeys.result(resultId),
    queryFn: async () => {
      reactQueryLogger.polling('Fetching analysis result for:', resultId);
      const result = await getResult(token, resultId);
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // Results don't change often - 10 minutes
    gcTime: 30 * 60 * 1000, // Keep results longer - 30 minutes
    retry: (failureCount) => failureCount < 2, // Results are less time-sensitive
  });
