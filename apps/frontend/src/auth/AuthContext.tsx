import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useLogin } from '../api/hooks'
import type { Session, UserRole } from '../types'

interface AuthContextValue {
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const { login: loginRequest, isLoading, error } = useLogin()

  const login = useCallback(async (username: string, password: string, role: UserRole) => {
    const nextSession = await loginRequest({ username, password, role })
    setSession(nextSession)
  }, [loginRequest])

  const logout = useCallback(() => {
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    session,
    isAuthenticated: session !== null,
    isLoading,
    error,
    login,
    logout,
  }), [session, isLoading, error, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
