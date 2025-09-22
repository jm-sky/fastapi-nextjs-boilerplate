// Axios API client with secure authentication interceptors

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { getErrorMessage } from './error.guards';
import { navigateToLogin } from './navigation';

// Secure token storage using closures
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  // Initialize tokens asynchronously to avoid race conditions
  async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    // Prevent multiple initialization attempts
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      const stored = this.getStoredTokens();
      if (stored.accessToken && stored.refreshToken) {
        this.accessToken = stored.accessToken;
        this.refreshToken = stored.refreshToken;
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Failed to initialize tokens:', getErrorMessage(error));
      this.isInitialized = true;
    } finally {
      this.initPromise = null;
    }
  }

  setTokens(access: string, refresh: string): void {
    this.accessToken = access;
    this.refreshToken = refresh;

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
      } catch (error) {
        console.warn('Failed to store tokens:', getErrorMessage(error));
      }
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;

    // Remove from localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } catch (error) {
        console.warn('Failed to clear tokens:', getErrorMessage(error));
      }
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  private getStoredTokens(): { accessToken: string | null; refreshToken: string | null } {
    if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };

    try {
      return {
        accessToken: localStorage.getItem('accessToken'),
        refreshToken: localStorage.getItem('refreshToken'),
      };
    } catch (error) {
      console.warn('Failed to read stored tokens:', getErrorMessage(error));
      return { accessToken: null, refreshToken: null };
    }
  }
}

// Create token manager instance
const tokenManager = new TokenManager();

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Ensure tokens are initialized
    await tokenManager.initialize();

    const accessToken = tokenManager.getAccessToken();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, redirect to login
        tokenManager.clearTokens();
        navigateToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers && token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        tokenManager.setTokens(newAccessToken, newRefreshToken);

        // Process queued requests
        processQueue(null, newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError instanceof Error ? refreshError : new Error('Token refresh failed'), null);
        tokenManager.clearTokens();
        navigateToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors with retry logic
    if (!error.response && originalRequest && !originalRequest._retryCount) {
      originalRequest._retryCount = 1;

      // Wait 1 second before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  }
);

// Export token management functions
export const setTokens = (access: string, refresh: string) => {
  tokenManager.setTokens(access, refresh);
};

export const clearTokens = () => {
  tokenManager.clearTokens();
};

export const getStoredTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };

  try {
    return {
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
    };
  } catch (error) {
    console.warn('Failed to read stored tokens:', getErrorMessage(error));
    return { accessToken: null, refreshToken: null };
  }
};

export default apiClient;

// Extend Axios config interface for TypeScript
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
  }
}