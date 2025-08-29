import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { getResult } from '../api/bloodwork-api';

export const useResultQuery = (resultId: string | undefined) => {
  const { getToken } = useAuth();
  
  return useQuery({
    queryKey: ['bloodwork-result', resultId],
    queryFn: async () => {
      // Temporarily bypass auth for testing
      const token = 'dummy-token'; // Backend auth is disabled
      return getResult(token, resultId!);
    },
    select: (response) => response.data,
    enabled: !!resultId,
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};
