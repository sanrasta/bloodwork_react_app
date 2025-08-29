import { apiClient, type ApiResponse } from './base';
import Constants from 'expo-constants';

// Helper function to make authenticated API calls
export const createAuthenticatedApiCall = <T extends any[], R>(
  apiFunction: (...args: [...T, authToken?: string]) => Promise<R>
) => {
  return async (authToken: string, ...args: T): Promise<R> => {
    return apiFunction(...args, authToken);
  };
};

// For multipart uploads (like PDF files), we need special handling
function getUploadBaseUrl(): string {
  // If environment variable is set, use it
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Auto-detect from Expo's development server
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const [ip] = Constants.expoConfig.hostUri.split(':');
    return `http://${ip}:3001/api`;
  }
  
  // Fallback for simulators
  return 'http://localhost:3001/api';
}

export const uploadWithAuth = async (
  formData: FormData,
  authToken: string,
  endpoint: string = '/uploads'
): Promise<ApiResponse<any>> => {
  const baseUrl = getUploadBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;
  
  console.log('🔍 [DEBUG] Upload URL:', fullUrl);
  console.log('🔍 [DEBUG] Auth token:', authToken);
  
  const response = await fetch(fullUrl, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${authToken}`,
      // Don't set Content-Type - let browser set it with proper boundary for multipart
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      message: errorData.message || 'Upload failed',
      status: response.status,
      errors: errorData.errors,
    };
  }

  return await response.json();
};

// Authenticated API methods
export const authenticatedApi = {
  get: createAuthenticatedApiCall(apiClient.get.bind(apiClient)),
  post: createAuthenticatedApiCall(apiClient.post.bind(apiClient)),
  put: createAuthenticatedApiCall(apiClient.put.bind(apiClient)),
  delete: createAuthenticatedApiCall(apiClient.delete.bind(apiClient)),
  upload: uploadWithAuth,
};




