import { apiClient, type ApiResponse, getApiBaseUrl } from './base';
import Constants from 'expo-constants';

// Helper function to make authenticated API calls
export const createAuthenticatedApiCall = <T extends any[], R>(
  apiFunction: (...args: [...T, authToken?: string]) => Promise<R>
) => {
  return async (authToken: string, ...args: T): Promise<R> => {
    // For post/put methods, we need to handle the options parameter correctly
    // The signature is: (endpoint, data, options?, authToken?)
    // We need to insert undefined for options when not provided
    if (args.length === 2) {
      // post(endpoint, data) -> post(endpoint, data, undefined, authToken)
      return (apiFunction as any)(args[0], args[1], undefined, authToken);
    }
    // For get/delete methods with single endpoint parameter
    // The signature is: (endpoint, options?, authToken?)
    if (args.length === 1) {
      // get(endpoint) -> get(endpoint, undefined, authToken)
      return (apiFunction as any)(args[0], undefined, authToken);
    }
    return apiFunction(...args, authToken);
  };
};

// For multipart uploads (like PDF files), we need special handling
function getUploadBaseUrl(): string {
  // Reuse the same resolver as the main API so behavior is consistent
  return getApiBaseUrl();
}

export const uploadWithAuth = async (
  formData: FormData,
  authToken: string,
  endpoint: string = '/uploads'
): Promise<ApiResponse<any>> => {
  const baseUrl = getUploadBaseUrl();
  const fullUrl = `${baseUrl}${endpoint}`;
  console.log('[uploadWithAuth] Uploading to:', fullUrl);
  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || 'Upload failed',
        status: response.status,
        errors: errorData.errors,
      } as ApiError;
    }

    return await response.json();
  } catch (e: any) {
    if (e && typeof e === 'object' && 'status' in e) {
      throw e as ApiError;
    }
    throw {
      message: 'Network error occurred',
      status: 0,
    } as ApiError;
  }
};

// Authenticated API methods
export const authenticatedApi = {
  get: createAuthenticatedApiCall(apiClient.get.bind(apiClient)),
  post: createAuthenticatedApiCall(apiClient.post.bind(apiClient)),
  put: createAuthenticatedApiCall(apiClient.put.bind(apiClient)),
  delete: createAuthenticatedApiCall(apiClient.delete.bind(apiClient)),
  upload: uploadWithAuth,
};




