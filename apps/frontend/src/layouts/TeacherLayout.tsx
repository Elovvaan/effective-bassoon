import { Outlet } from 'react-router-dom'
import { RoleLayoutShell } from './RoleLayoutShell'

export function TeacherLayout() {
  return (
    <RoleLayoutShell title="Teacher Workspace">
      <Outlet />
    </RoleLayoutShell>
  )
}
