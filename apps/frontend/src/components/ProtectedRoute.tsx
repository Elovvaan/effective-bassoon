import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { UserRole } from '../types'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
  allowRoles: UserRole[]
}

export function ProtectedRoute({ children, allowRoles }: ProtectedRouteProps) {
  const { isAuthenticated, session } = useAuth()

  if (!isAuthenticated || !session) {
    return <Navigate to="/" replace />
  }

  if (!allowRoles.includes(session.user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
