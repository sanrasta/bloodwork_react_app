/**
 * Centralized Query Key Factory for Bloodwork Feature
 * 
 * Benefits:
 * - Type safety and autocomplete
 * - Single source of truth for cache keys
 * - Hierarchical invalidation support
 * - Prevents typos in query invalidation
 */

export const bloodworkQueryKeys = {
  // Root key for all bloodwork-related queries
  all: ['bloodwork'] as const,
  
  // Upload-related queries
  uploads: () => [...bloodworkQueryKeys.all, 'uploads'] as const,
  upload: (uploadId: string) => [...bloodworkQueryKeys.uploads(), uploadId] as const,
  userUploads: (userId: string) => [...bloodworkQueryKeys.uploads(), 'user', userId] as const,
  
  // Analysis job queries
  analysisJobs: () => [...bloodworkQueryKeys.all, 'analysis-jobs'] as const,
  analysisJob: (jobId: string) => [...bloodworkQueryKeys.analysisJobs(), jobId] as const,
  userAnalysisJobs: (userId: string) => [...bloodworkQueryKeys.analysisJobs(), 'user', userId] as const,
  
  // Result queries
  results: () => [...bloodworkQueryKeys.all, 'results'] as const,
  result: (resultId: string) => [...bloodworkQueryKeys.results(), resultId] as const,
  userResults: (userId: string) => [...bloodworkQueryKeys.results(), 'user', userId] as const,
} as const;

// Type helper for query keys
export type BloodworkQueryKey = ReturnType<
  (typeof bloodworkQueryKeys)[keyof typeof bloodworkQueryKeys] extends (...args: any) => any
    ? (typeof bloodworkQueryKeys)[keyof typeof bloodworkQueryKeys]
    : () => (typeof bloodworkQueryKeys)[keyof typeof bloodworkQueryKeys]
>;

// Helper functions for common invalidation patterns
export const invalidationHelpers = {
  // Invalidate all bloodwork data
  invalidateAll: () => bloodworkQueryKeys.all,
  
  // Invalidate all analysis jobs (useful after starting new analysis)
  invalidateAnalysisJobs: () => bloodworkQueryKeys.analysisJobs(),
  
  // Invalidate all results (useful after analysis completion)
  invalidateResults: () => bloodworkQueryKeys.results(),
  
  // Invalidate specific user's data
  invalidateUserData: (userId: string) => [
    bloodworkQueryKeys.userUploads(userId),
    bloodworkQueryKeys.userAnalysisJobs(userId),
    bloodworkQueryKeys.userResults(userId),
  ],
} as const;
