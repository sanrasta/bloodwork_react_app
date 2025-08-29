import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { getAnalysisJob } from '../api/bloodwork-api';

export const useAnalysisJob = (jobId: string | undefined) => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['analysis-job', jobId],
    queryFn: async () => {
      // Temporarily bypass auth for testing
      const token = 'dummy-token'; // Backend auth is disabled
      console.log('🔄 Polling job status for:', jobId);
      const result = await getAnalysisJob(token, jobId!);
      console.log('📊 Job status:', result.data.status, 'Progress:', result.data.progress);
      return result;
    },
    select: (response) => response.data,
    enabled: !!jobId,
    refetchInterval: 2000, // Always poll every 2 seconds for now
    staleTime: 0, // Always refetch when requested
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};
