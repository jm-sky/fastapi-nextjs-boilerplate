// Centralized application configuration

export interface AppConfig {
  name: string;
  title: string;
  description: string;
  version: string;
  author: string;
  url: string;
  keywords: string[];
  themeColor: string;
  favicon: string;
  ogImage?: string;
}

// Default configuration
const DEFAULT_APP_CONFIG: AppConfig = {
  name: 'SaaS Boilerplate',
  title: 'SaaS Boilerplate - FastAPI & Next.js',
  description: 'A modern SaaS boilerplate built with FastAPI backend and Next.js frontend',
  version: '1.0.0',
  author: 'SaaS Team',
  url: 'https://localhost:3001',
  keywords: ['saas', 'boilerplate', 'nextjs', 'fastapi', 'typescript', 'react'],
  themeColor: '#0ea5e9', // sky-500
  favicon: '/favicon.ico',
  ogImage: '/og-image.png',
};

// Environment-based configuration
const getAppConfigFromEnv = (): Partial<AppConfig> => {
  const config: Partial<AppConfig> = {};

  // App name and branding
  if (process.env.NEXT_PUBLIC_APP_NAME) {
    config.name = process.env.NEXT_PUBLIC_APP_NAME;
  }

  if (process.env.NEXT_PUBLIC_APP_TITLE) {
    config.title = process.env.NEXT_PUBLIC_APP_TITLE;
  }

  if (process.env.NEXT_PUBLIC_APP_DESCRIPTION) {
    config.description = process.env.NEXT_PUBLIC_APP_DESCRIPTION;
  }

  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    config.version = process.env.NEXT_PUBLIC_APP_VERSION;
  }

  if (process.env.NEXT_PUBLIC_APP_AUTHOR) {
    config.author = process.env.NEXT_PUBLIC_APP_AUTHOR;
  }

  // URL configuration
  if (process.env.NEXT_PUBLIC_APP_URL) {
    config.url = process.env.NEXT_PUBLIC_APP_URL;
  } else if (process.env.VERCEL_URL) {
    // Vercel deployment URL
    config.url = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NEXT_PUBLIC_PORT) {
    // Local development URL
    config.url = `http://localhost:${process.env.NEXT_PUBLIC_PORT}`;
  }

  // SEO and branding
  if (process.env.NEXT_PUBLIC_APP_KEYWORDS) {
    config.keywords = process.env.NEXT_PUBLIC_APP_KEYWORDS.split(',').map(k => k.trim());
  }

  if (process.env.NEXT_PUBLIC_THEME_COLOR) {
    config.themeColor = process.env.NEXT_PUBLIC_THEME_COLOR;
  }

  if (process.env.NEXT_PUBLIC_APP_FAVICON) {
    config.favicon = process.env.NEXT_PUBLIC_APP_FAVICON;
  }

  if (process.env.NEXT_PUBLIC_OG_IMAGE) {
    config.ogImage = process.env.NEXT_PUBLIC_OG_IMAGE;
  }

  return config;
};

// Merged configuration
export const APP_CONFIG: AppConfig = {
  ...DEFAULT_APP_CONFIG,
  ...getAppConfigFromEnv(),
};

// Helper functions for common use cases
export const getPageTitle = (pageTitle?: string): string => {
  if (!pageTitle) {
    return APP_CONFIG.title;
  }
  return `${pageTitle} | ${APP_CONFIG.name}`;
};

export const getPageDescription = (pageDescription?: string): string => {
  return pageDescription || APP_CONFIG.description;
};

export const getCanonicalUrl = (path = ''): string => {
  const baseUrl = APP_CONFIG.url.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Validation function
export const validateAppConfig = (config: AppConfig): boolean => {
  try {
    // Required fields
    if (!config.name || !config.title || !config.description) {
      return false;
    }

    // URL validation
    if (config.url.startsWith('http')) {
      new URL(config.url);
    }

    // Version format validation (basic semver check)
    const versionRegex = /^\d+\.\d+\.\d+/;
    if (!versionRegex.test(config.version)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('App Configuration:', APP_CONFIG);

  if (!validateAppConfig(APP_CONFIG)) {
    console.warn('Invalid app configuration detected!');
  }
}