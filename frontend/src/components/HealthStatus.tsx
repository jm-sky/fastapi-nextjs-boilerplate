'use client'

import { useHealthCheck } from '@/hooks/useHealthCheck'

export function HealthStatus() {
  const { data, isLoading, error } = useHealthCheck()

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border">
        <p className="text-sm text-blue-600 dark:text-blue-400">Checking API status...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border">
        <p className="text-sm text-red-600 dark:text-red-400">API connection failed</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border">
      <p className="text-sm text-green-600 dark:text-green-400">
        API Status: {data?.status} - {data?.message}
      </p>
    </div>
  )
}