import { useQuery } from '@tanstack/react-query';
import { normalizeResult } from './transform';
import type { ResultSummaryDTO } from '../types';
import { apiClient } from '@/shared/api/base';

export const resultKeys = {
  detail: (id: string) => ['results', 'detail', id] as const,
};

export function useResultDetail(resultId: string) {
  return useQuery({
    queryKey: resultKeys.detail(resultId),
    queryFn: async (): Promise<ResultSummaryDTO> => {
      const res = await apiClient.get<{ data: any }>(`/results/${resultId}`);
      return normalizeResult(res.data);
    },
    enabled: !!resultId,
    staleTime: 5 * 60 * 1000,
  });
}


