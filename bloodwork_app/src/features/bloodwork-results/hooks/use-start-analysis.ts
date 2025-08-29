import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { startAnalysis } from '../api/bloodwork-api';

export const useStartAnalysis = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  
  return useMutation({
    mutationFn: async (uploadId: string) => {
      // Temporarily bypass auth for testing
      const token = 'dummy-token'; // Backend auth is disabled
      return startAnalysis(token, uploadId);
    },
    onSuccess: () => {
      // Optionally invalidate relevant queries
      // queryClient.invalidateQueries({ queryKey: ['analysis'] });
    },
    onError: (error) => {
      console.error('Failed to start analysis:', error);
    },
  });
};
