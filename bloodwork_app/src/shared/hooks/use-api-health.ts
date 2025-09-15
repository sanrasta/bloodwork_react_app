import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApiBaseUrl } from '../api/base';

type HealthResponse = {
  status: string;
  timestamp?: string;
  services?: Record<string, unknown>;
  endpoints?: Record<string, string>;
};

export function useApiHealth(pollMs: number = 15000) {
  const baseUrl = useMemo(() => getApiBaseUrl(), []);
  const healthUrl = `${baseUrl}/health`;

  const query = useQuery<HealthResponse>({
    queryKey: ['api-health', healthUrl],
    queryFn: async () => {
      const res = await fetch(healthUrl);
      if (!res.ok) {
        throw new Error(`Health check failed: ${res.status}`);
      }
      return res.json();
    },
    refetchInterval: (q) => {
      if (q.state.status === 'error') return 20000;
      return pollMs;
    },
    staleTime: 10000,
    retry: 1,
  });

  const isHealthy = query.data?.status === 'healthy';

  return {
    ...query,
    baseUrl,
    healthUrl,
    isHealthy,
  };
}


