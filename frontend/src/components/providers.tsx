'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthProvider } from '@/context/auth.context'
import { setNavigateFunction } from '@/lib/navigation'
import { AuthErrorBoundary } from '@/components/error-boundary'

function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Set up navigation function for use in axios interceptors
    setNavigateFunction((path: string) => router.push(path))
  }, [router])

  return <>{children}</>
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationProvider>
        <AuthErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AuthErrorBoundary>
      </NavigationProvider>
    </QueryClientProvider>
  )
}