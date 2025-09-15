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
      return result.data; 
    },

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
    staleTime: 10 * 60 * 1000, 
    gcTime: 30 * 60 * 1000, 
    retry: (failureCount) => failureCount < 2, 
  });
