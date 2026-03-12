import type { ReactNode } from 'react'
import { RoleNavigation } from '../components/RoleNavigation'
import { useAuth } from '../hooks/useAuth'

export function RoleLayoutShell({ title, children }: { title: string; children: ReactNode }) {
  const { session, logout } = useAuth()

  if (!session) {
    return null
  }

  return (
    <div className="app-shell" data-testid="role-layout-shell">
      <aside>
        <h2 data-testid="role-layout-title">{title}</h2>
        <p data-testid="role-layout-user-name">{session.user.name}</p>
        <RoleNavigation role={session.user.role} />
        <button data-testid="signout-button" type="button" onClick={logout}>Sign out</button>
      </aside>
      <main>{children}</main>
    </div>
  )
}
