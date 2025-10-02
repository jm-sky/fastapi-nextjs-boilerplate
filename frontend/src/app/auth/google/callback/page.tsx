'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Call backend callback endpoint with all OAuth params from URL
        const response = await fetch(`/api/auth/google/callback${window.location.search}`, {
          method: 'GET',
          credentials: 'include', // Include cookies for session
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Authentication failed' }));
          throw new Error(errorData.detail || 'Failed to authenticate with Google');
        }

        const data = await response.json();

        // Save tokens to localStorage (auth context will pick them up)
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Redirect to dashboard - auth context will automatically load the user
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Google OAuth error:', error);
        setError(error instanceof Error ? error.message : 'Failed to complete Google sign-in');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-700">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => router.push('/login')}
                className="text-sm text-blue-600 hover:underline"
              >
                Return to login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Completing sign-in...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
