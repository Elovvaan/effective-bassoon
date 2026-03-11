import { Outlet } from 'react-router-dom'
import { RoleLayoutShell } from './RoleLayoutShell'

export function StudentLayout() {
  return (
    <RoleLayoutShell title="Student Workspace">
      <Outlet />
    </RoleLayoutShell>
  )
}
