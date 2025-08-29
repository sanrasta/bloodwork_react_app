import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { uploadPdf } from '../api/bloodwork-api';

export const useUploadMutation = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Temporarily bypass auth for testing
      const token = 'dummy-token'; // Backend auth is disabled
      return uploadPdf(token, formData);
    },
    onSuccess: () => {
      // Optionally invalidate relevant queries
      // queryClient.invalidateQueries({ queryKey: ['uploads'] });
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });
};
