import type { UserRole, UserSession } from '@packages/types'

export type { UserRole }

export type Session = UserSession

export interface NavItem {
  label: string
  path: string
}
