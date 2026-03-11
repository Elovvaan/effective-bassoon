import { useCallback, useState } from 'react'

import type { Session } from '../types'
import { useApi } from '../hooks/useApi'
import { apiClient, type LoginPayload } from './client'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      return await apiClient.login(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown login error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { login, isLoading, error }
}

export function useAnalytics(session: Session | null) {
  return useApi(
    async () => {
      if (!session) {
        throw new Error('Session is required')
      }
      return apiClient.getAnalytics(session)
    },
    [session],
  )
}
