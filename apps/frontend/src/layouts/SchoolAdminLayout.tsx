import { Outlet } from 'react-router-dom'
import { RoleLayoutShell } from './RoleLayoutShell'

export function SchoolAdminLayout() {
  return (
    <RoleLayoutShell title="School Admin">
      <Outlet />
    </RoleLayoutShell>
  )
}
