'use client';

// Auth context for global authentication state

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useCurrentUser, useLogin, useRegister, useLogout } from '@/hooks/auth.hook';
import { AuthContextType, LoginRequest, RegisterRequest } from '@/types/auth.type';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const isAuthenticated = !!user;

  const login = useCallback(async (credentials: LoginRequest) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const register = useCallback(async (userData: RegisterRequest) => {
    await registerMutation.mutateAsync(userData);
  }, [registerMutation]);

  const logout = useCallback(() => {
    logoutMutation.mutate();
  }, [logoutMutation]);

  const refreshTokens = useCallback(async () => {
    // Token refresh is handled automatically by axios interceptors
    // This function is kept for interface compatibility
    return Promise.resolve();
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AuthContextType = useMemo(() => ({
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    refreshTokens,
  }), [
    user,
    isAuthenticated,
    isLoading,
    loginMutation.isPending,
    registerMutation.isPending,
    login,
    register,
    logout,
    refreshTokens,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}