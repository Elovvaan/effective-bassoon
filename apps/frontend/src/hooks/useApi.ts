import { useCallback, useEffect, useState } from 'react'

export function useApi<T>(request: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await request()
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, isLoading, error, reload, setData }
}
