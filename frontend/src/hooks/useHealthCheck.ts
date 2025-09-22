import { useQuery } from '@tanstack/react-query'

type HealthResponse = {
  status: string
  message: string
}

async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  return response.json()
}

export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    staleTime: 30 * 1000, // 30 seconds
  })
}