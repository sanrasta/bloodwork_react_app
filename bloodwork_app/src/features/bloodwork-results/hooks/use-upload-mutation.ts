import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-expo';
import { uploadPdf } from '../api/bloodwork-api';
import { invalidationHelpers } from '../lib/query-keys';
import { reactQueryLogger } from '../../../shared/utils/logger';

/**
 * Hook for uploading PDF files with proper cache invalidation
 * 
 * Features:
 * - Type-safe query key invalidation
 * - Consistent error handling
 * - Automatic cache updates after successful upload
 */
export const useUploadMutation = () => {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  
  return useMutation({
    mutationKey: ['upload'], // Consistent mutation identification
    mutationFn: async (formData: FormData) => {
      // Temporarily bypass auth for testing
      const token = 'dummy-token'; // Backend auth is disabled
      reactQueryLogger.mutation('Starting PDF upload...');
      return uploadPdf(token, formData);
    },
    onSuccess: (data) => {
      reactQueryLogger.mutation('Upload successful:', data);
      // Invalidate uploads to refetch the list
      queryClient.invalidateQueries({ 
        queryKey: invalidationHelpers.invalidateAll() 
      });
      reactQueryLogger.cache('Invalidated all bloodwork queries after upload');
    },
    onError: (error) => {
      reactQueryLogger.error('Upload failed:', error);
    },
  });
};
