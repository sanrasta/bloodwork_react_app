// Base API configuration and fetch wrapper
import Constants from 'expo-constants';

import { Platform } from 'react-native';

export function getApiBaseUrl(): string {
  const desiredPort = Number(process.env.EXPO_PUBLIC_API_PORT) || 3000;

  // 1) Env override wins. If it uses localhost in dev, rewrite to Expo host IP.
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    if (__DEV__ && Constants.expoConfig?.hostUri && /localhost/i.test(envUrl)) {
      const [ip] = String(Constants.expoConfig.hostUri).split(':');
      const rewritten = envUrl.replace(/localhost/gi, ip);
      console.log('🔍 [DEBUG] Rewriting localhost to Expo host IP:', rewritten);
      return rewritten;
    }
    return envUrl;
  }

  // 2) Auto-detect IP from Expo when available (works on physical devices)
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const [ip] = String(Constants.expoConfig.hostUri).split(':');
    const url = `http://${ip}:${desiredPort}/api`;
    console.log('🔍 [DEBUG] Auto-detected IP from Expo:', url);
    return url;
  }

  // 3) Fallbacks for emulators/simulators
  if (Platform.OS === 'android') {
    // Android emulator loopback to host
    return `http://10.0.2.2:${desiredPort}/api`;
  }
  // iOS simulator / generic fallback
  return `http://localhost:${desiredPort}/api`;
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
