// Base API configuration and fetch wrapper
import Constants from 'expo-constants';

function getApiBaseUrl(): string {
  // If environment variable is set, use it (production/custom config)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // Auto-detect from Expo's development server
  // When using --lan, Expo provides the network IP in manifest
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const [ip] = Constants.expoConfig.hostUri.split(':');
    console.log('🔍 [DEBUG] Auto-detected IP from Expo:', ip);
    return `http://${ip}:3001/api`;
  }
  
  // Fallback for simulators or when hostUri is not available
  console.log('🔍 [DEBUG] Using localhost fallback');
  return 'http://localhost:3001/api';
}

const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    authToken?: string
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.message || 'An error occurred',
          status: response.status,
          errors: errorData.errors,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }
      throw {
        message: 'Network error occurred',
        status: 0,
      } as ApiError;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit, authToken?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' }, authToken);
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit, authToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, authToken);
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit, authToken?: string): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, authToken);
  }

  async delete<T>(endpoint: string, options?: RequestInit, authToken?: string): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' }, authToken);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
