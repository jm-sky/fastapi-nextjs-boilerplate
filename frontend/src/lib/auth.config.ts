// Authentication configuration for flexible routing

export interface AuthConfig {
  loginRedirect: string;
  logoutRedirect: string;
  unauthorizedRedirect: string;
  registerRedirect?: string;
}

// Default configuration
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  loginRedirect: '/dashboard',
  logoutRedirect: '/login',
  unauthorizedRedirect: '/login',
  registerRedirect: '/dashboard',
};

// Environment-specific overrides
const getAuthConfigFromEnv = (): Partial<AuthConfig> => {
  if (typeof window !== 'undefined') {
    // Client-side: these could come from environment variables or runtime config
    return {};
  }
  
  // Server-side: read from environment variables
  return {
    loginRedirect: process.env.NEXT_PUBLIC_LOGIN_REDIRECT || DEFAULT_AUTH_CONFIG.loginRedirect,
    logoutRedirect: process.env.NEXT_PUBLIC_LOGOUT_REDIRECT || DEFAULT_AUTH_CONFIG.logoutRedirect,
    unauthorizedRedirect: process.env.NEXT_PUBLIC_UNAUTHORIZED_REDIRECT || DEFAULT_AUTH_CONFIG.unauthorizedRedirect,
    registerRedirect: process.env.NEXT_PUBLIC_REGISTER_REDIRECT || DEFAULT_AUTH_CONFIG.registerRedirect,
  };
};

// Merged configuration
export const AUTH_CONFIG: AuthConfig = {
  ...DEFAULT_AUTH_CONFIG,
  ...getAuthConfigFromEnv(),
};
