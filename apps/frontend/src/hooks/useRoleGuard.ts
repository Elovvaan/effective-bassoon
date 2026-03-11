import type { UserRole } from '@packages/types'

import { useAuth } from './useAuth'

export function useRoleGuard(allowedRoles: UserRole[]) {
  const { session } = useAuth()
  const canAccess = Boolean(session && allowedRoles.includes(session.user.role))
  return { canAccess, role: session?.user.role }
}
