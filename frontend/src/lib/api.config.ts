// API configuration with environment-based settings

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseURL: '/api',
  timeout: 10000, // 10 seconds
  retryAttempts: 1,
  retryDelay: 1000, // 1 second
};

const getApiConfigFromEnv = (): Partial<ApiConfig> => {
  const config: Partial<ApiConfig> = {};

  // Base URL configuration with fallbacks
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    config.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;
  } else if (process.env.NODE_ENV === 'production') {
    // In production, assume API is at the same domain
    config.baseURL = '/api';
  } else {
    // In development, check for backend URL or default to proxy
    config.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL 
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`
      : '/api';
  }

  // Timeout configuration
  if (process.env.NEXT_PUBLIC_API_TIMEOUT) {
    const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT, 10);
    if (!isNaN(timeout)) {
      config.timeout = timeout;
    }
  }

  // Retry configuration
  if (process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS) {
    const retryAttempts = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS, 10);
    if (!isNaN(retryAttempts)) {
      config.retryAttempts = retryAttempts;
    }
  }

  if (process.env.NEXT_PUBLIC_API_RETRY_DELAY) {
    const retryDelay = parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY, 10);
    if (!isNaN(retryDelay)) {
      config.retryDelay = retryDelay;
    }
  }

  return config;
};

export const API_CONFIG: ApiConfig = {
  ...DEFAULT_CONFIG,
  ...getApiConfigFromEnv(),
};

// Validation function to check if API configuration is valid
export function validateApiConfig(config: ApiConfig): boolean {
  try {
    // Validate base URL
    if (!config.baseURL) return false;
    
    // Try to create a URL to validate format (for absolute URLs)
    if (config.baseURL.startsWith('http')) {
      new URL(config.baseURL);
    }
    
    // Validate timeout
    if (config.timeout <= 0) return false;
    
    // Validate retry attempts
    if (config.retryAttempts < 0) return false;
    
    // Validate retry delay
    if (config.retryDelay < 0) return false;
    
    return true;
  } catch {
    return false;
  }
}

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', API_CONFIG);
  
  if (!validateApiConfig(API_CONFIG)) {
    console.warn('Invalid API configuration detected!');
  }
}
