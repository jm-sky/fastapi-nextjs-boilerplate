// Navigation utility for client-side routing
// Can be used from anywhere, including axios interceptors

import { AUTH_CONFIG } from './auth.config';

let navigateFunction: ((path: string) => void) | null = null;

export function setNavigateFunction(navigate: (path: string) => void) {
  navigateFunction = navigate;
}

export function navigateTo(path: string) {
  if (navigateFunction) {
    navigateFunction(path);
  } else {
    // Fallback to window.location if router not available
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }
}

export function navigateToLogin() {
  navigateTo(AUTH_CONFIG.unauthorizedRedirect);
}

export function navigateToLogout() {
  navigateTo(AUTH_CONFIG.logoutRedirect);
}
