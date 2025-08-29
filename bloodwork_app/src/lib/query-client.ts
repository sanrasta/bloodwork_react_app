import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      // Remove refetchOnWindowFocus: false - let RN integration handle focus
      refetchOnWindowFocus: true, // Will be managed by RN integration
    },
    mutations: {
      retry: 1,
    },
  },
});
