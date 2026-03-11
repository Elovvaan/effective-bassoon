export type UserRole = 'district_admin' | 'school_admin' | 'teacher' | 'student'

export interface Session {
  token: string
  user: {
    id: string
    name: string
    role: UserRole
    schoolId?: string
    districtId?: string
  }
}

export interface NavItem {
  label: string
  path: string
}
