import { Outlet } from 'react-router-dom'
import { RoleLayoutShell } from './RoleLayoutShell'

export function DistrictAdminLayout() {
  return (
    <RoleLayoutShell title="District Admin">
      <Outlet />
    </RoleLayoutShell>
  )
}
