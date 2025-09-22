// TanStack Query hooks for authentication

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/auth.api';
import { setTokens, clearTokens, getStoredTokens } from '@/lib/api.client';
import { LoginRequest, RegisterRequest } from '@/types/auth.type';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  currentUser: () => [...authKeys.user(), 'current'] as const,
};

/**
 * Hook to get current user information
 */
export const useCurrentUser = () => {
  const { accessToken } = getStoredTokens();

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: authAPI.getCurrentUser,
    enabled: !!accessToken, // Only run if we have a token
    retry: false, // Don't retry on 401s
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for user login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authAPI.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      setTokens(data.accessToken, data.refreshToken);

      // Update user cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authAPI.register(userData),
    onSuccess: (data) => {
      // Store tokens
      setTokens(data.accessToken, data.refreshToken);

      // Update user cache
      queryClient.setQueryData(authKeys.currentUser(), data.user);

      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSettled: () => {
      // Always clear tokens and cache, even if logout request fails
      clearTokens();

      // Clear all cached data
      queryClient.clear();

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    },
  });
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { data: user, isLoading, isError } = useCurrentUser();

  return {
    isAuthenticated: !!user && !isError,
    isLoading,
    user,
  };
};