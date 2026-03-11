import { NavLink } from 'react-router-dom'
import type { NavItem, UserRole } from '../types'

const navByRole: Record<UserRole, NavItem[]> = {
  district_admin: [
    { label: 'Admin Console', path: '/admin' },
    { label: 'Analytics', path: '/analytics' },
  ],
  school_admin: [
    { label: 'Admin Console', path: '/admin' },
    { label: 'Analytics', path: '/analytics' },
  ],
  teacher: [
    { label: 'Teacher Dashboard', path: '/teacher' },
    { label: 'Analytics', path: '/analytics' },
  ],
  student: [
    { label: 'Student Portal', path: '/student' },
  ],
}

export function RoleNavigation({ role }: { role: UserRole }) {
  return (
    <nav className="nav-list">
      {navByRole[role].map((item) => (
        <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
