import { useCallback, useEffect, useState } from 'react'
import { apiClient, type LoginPayload } from './client'
import type { Session } from '../types'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true)
    setError(null)
    try {
      const session = await apiClient.login(payload)
      return session
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
  const [data, setData] = useState<{ activeUsers: number; completionRate: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    async function load() {
      if (!session) {
        setData(null)
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const result = await apiClient.getAnalytics(session.token)
        if (!ignore) {
          setData(result)
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unknown analytics error')
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      ignore = true
    }
  }, [session])

  return { data, isLoading, error }
}
