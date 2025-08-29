import { apiClient, type ApiResponse } from '../../../shared/api/base';
import { authenticatedApi } from '../../../shared/api/authenticated-api';
import type { BloodworkResult, BloodworkFilters, AnalysisJob, UploadResponse } from '../types/types';
import type { BloodworkResultInput } from '../schemas/bloodwork-schema';

// GET endpoints (authenticated)
export const getBloodworkResults = async (
  authToken: string,
  filters?: BloodworkFilters
): Promise<ApiResponse<BloodworkResult[]>> => {
  const searchParams = new URLSearchParams();
  
  if (filters?.dateRange) {
    searchParams.append('startDate', filters.dateRange.start);
    searchParams.append('endDate', filters.dateRange.end);
  }
  
  if (filters?.testType) {
    searchParams.append('testType', filters.testType);
  }
  
  if (filters?.status) {
    searchParams.append('status', filters.status);
  }
  
  const queryString = searchParams.toString();
  const endpoint = `/bloodwork-results${queryString ? `?${queryString}` : ''}`;
  
  return authenticatedApi.get(authToken, endpoint);
};

export const getBloodworkResultById = async (
  authToken: string,
  id: string
): Promise<ApiResponse<BloodworkResult>> => {
  return authenticatedApi.get(authToken, `/bloodwork-results/${id}`);
};

// POST endpoints (authenticated)
export const createBloodworkResult = async (
  authToken: string,
  data: BloodworkResultInput
): Promise<ApiResponse<BloodworkResult>> => {
  return authenticatedApi.post(authToken, '/bloodwork-results', data);
};

// PUT endpoints (authenticated)
export const updateBloodworkResult = async (
  authToken: string,
  id: string,
  data: Partial<BloodworkResultInput>
): Promise<ApiResponse<BloodworkResult>> => {
  return authenticatedApi.put(authToken, `/bloodwork-results/${id}`, data);
};

// DELETE endpoints (authenticated)
export const deleteBloodworkResult = async (
  authToken: string,
  id: string
): Promise<ApiResponse<void>> => {
  return authenticatedApi.delete(authToken, `/bloodwork-results/${id}`);
};

// === MVP ENDPOINTS (Authenticated) ===

// Upload PDF file
export const uploadPdf = async (authToken: string, formData: FormData): Promise<ApiResponse<UploadResponse>> => {
  return authenticatedApi.upload(formData, authToken, '/uploads');
};

// Start AI analysis job
export const startAnalysis = async (authToken: string, uploadId: string): Promise<ApiResponse<{ jobId: string; status: 'queued' | 'running' }>> => {
  return authenticatedApi.post(authToken, '/analysis', { uploadId });
};

// Get analysis job status
export const getAnalysisJob = async (authToken: string, jobId: string): Promise<ApiResponse<AnalysisJob>> => {
  return authenticatedApi.get(authToken, `/analysis/${jobId}`);
};

// Get analysis result
export const getResult = async (authToken: string, resultId: string): Promise<ApiResponse<BloodworkResult>> => {
  return authenticatedApi.get(authToken, `/results/${resultId}`);
};
