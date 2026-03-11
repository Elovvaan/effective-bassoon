import { useMemo, useState } from 'react'
import type { ApiClassroom, ApiSchool, ApiUser, CreateClassroomInput, CreateSchoolInput, CreateUserInput } from '@packages/types'
import { Card, DataTable, EmptyState } from '@packages/ui'

import { apiClient } from '../api/client'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { usePagination } from '../hooks/usePagination'
import { useRoleGuard } from '../hooks/useRoleGuard'

export function AdminConsolePage() {
  const { session } = useAuth()
  const { canAccess } = useRoleGuard(['district_admin', 'school_admin'])

  const usersApi = useApi(async () => (session ? apiClient.listUsers(session) : { items: [] }), [session])
  const schoolsApi = useApi(async () => (session ? apiClient.listSchools(session) : { items: [] }), [session])
  const classesApi = useApi(async () => (session ? apiClient.listClasses(session) : { items: [] }), [session])

  const [userForm, setUserForm] = useState<CreateUserInput>({ role: 'teacher', email: '', firstName: '', lastName: '' })
  const [schoolForm, setSchoolForm] = useState<CreateSchoolInput>({ name: '', code: '' })
  const [classForm, setClassForm] = useState<CreateClassroomInput>({ schoolId: '', teacherId: '', name: '', courseCode: '', academicYear: '2026-2027' })
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null)

  const users = usersApi.data?.items ?? []
  const schools = schoolsApi.data?.items ?? []
  const classes = classesApi.data?.items ?? []

  const pagedUsers = usePagination(users, 8)

  const rosterRows = useMemo(() => {
    return classes.map((item) => ({ ...item, schoolName: schools.find((school) => school.id === item.schoolId)?.name ?? item.schoolId }))
  }, [classes, schools])

  if (!canAccess) {
    return <EmptyState message="You do not have permission to access the admin console." />
  }

  async function submitUserForm() {
    if (!session) return
    if (editingUserId) {
      await apiClient.updateUser(session, editingUserId, userForm)
      setEditingUserId(null)
    } else {
      await apiClient.createUser(session, userForm)
    }
    setUserForm({ role: 'teacher', email: '', firstName: '', lastName: '' })
    await usersApi.reload()
  }

  async function submitSchoolForm() {
    if (!session || session.user.role !== 'district_admin') return
    if (editingSchoolId) {
      await apiClient.updateSchool(session, editingSchoolId, schoolForm)
      setEditingSchoolId(null)
    } else {
      await apiClient.createSchool(session, schoolForm)
    }
    setSchoolForm({ name: '', code: '' })
    await schoolsApi.reload()
  }

  async function submitClassForm() {
    if (!session) return
    await apiClient.createClass(session, classForm)
    setClassForm({ schoolId: '', teacherId: '', name: '', courseCode: '', academicYear: '2026-2027' })
    await classesApi.reload()
  }

  return (
    <section>
      <h1>Admin Console</h1>
      {(usersApi.isLoading || schoolsApi.isLoading || classesApi.isLoading) ? <p>Loading records...</p> : null}
      {usersApi.error ? <p className="error">{usersApi.error}</p> : null}

      <Card title="User Management">
        <form onSubmit={(event) => { event.preventDefault(); void submitUserForm() }}>
          <input placeholder="First name" value={userForm.firstName} onChange={(event) => setUserForm((prev) => ({ ...prev, firstName: event.target.value }))} required />
          <input placeholder="Last name" value={userForm.lastName} onChange={(event) => setUserForm((prev) => ({ ...prev, lastName: event.target.value }))} required />
          <input type="email" placeholder="Email" value={userForm.email} onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))} required />
          <select value={userForm.role} onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value as ApiUser['role'] }))}>
            <option value="district_admin">District Admin</option>
            <option value="school_admin">School Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
          <select value={userForm.schoolId ?? ''} onChange={(event) => setUserForm((prev) => ({ ...prev, schoolId: event.target.value || undefined }))}>
            <option value="">No school</option>
            {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
          </select>
          <button type="submit">{editingUserId ? 'Update User' : 'Create User'}</button>
        </form>

        <DataTable<ApiUser>
          columns={[
            { key: 'firstName', label: 'First Name' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
            { key: 'id', label: 'Actions', render: (row) => <button type="button" onClick={() => { setEditingUserId(row.id); setUserForm(row) }}>Edit</button> },
          ]}
          rows={pagedUsers.pageItems}
        />
        <p>Page {pagedUsers.page} of {pagedUsers.totalPages}</p>
      </Card>

      {session?.user.role === 'district_admin' ? (
        <Card title="School Management">
          <form onSubmit={(event) => { event.preventDefault(); void submitSchoolForm() }}>
            <input placeholder="School name" value={schoolForm.name} onChange={(event) => setSchoolForm((prev) => ({ ...prev, name: event.target.value }))} required />
            <input placeholder="Code" value={schoolForm.code} onChange={(event) => setSchoolForm((prev) => ({ ...prev, code: event.target.value }))} required />
            <input placeholder="Timezone" value={schoolForm.timezone ?? ''} onChange={(event) => setSchoolForm((prev) => ({ ...prev, timezone: event.target.value || undefined }))} />
            <button type="submit">{editingSchoolId ? 'Update School' : 'Create School'}</button>
          </form>

          <DataTable<ApiSchool>
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'code', label: 'Code' },
              { key: 'timezone', label: 'Timezone' },
              { key: 'id', label: 'Actions', render: (row) => <button type="button" onClick={() => { setEditingSchoolId(row.id); setSchoolForm(row) }}>Edit</button> },
            ]}
            rows={schools}
          />
        </Card>
      ) : null}

      <Card title="Class Management and Roster View">
        <form onSubmit={(event) => { event.preventDefault(); void submitClassForm() }}>
          <select value={classForm.schoolId} onChange={(event) => setClassForm((prev) => ({ ...prev, schoolId: event.target.value }))} required>
            <option value="">Choose school</option>
            {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
          </select>
          <select value={classForm.teacherId} onChange={(event) => setClassForm((prev) => ({ ...prev, teacherId: event.target.value }))} required>
            <option value="">Choose teacher</option>
            {users.filter((user) => user.role === 'teacher').map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>)}
          </select>
          <input placeholder="Class name" value={classForm.name} onChange={(event) => setClassForm((prev) => ({ ...prev, name: event.target.value }))} required />
          <input placeholder="Course code" value={classForm.courseCode} onChange={(event) => setClassForm((prev) => ({ ...prev, courseCode: event.target.value }))} required />
          <input placeholder="Academic year" value={classForm.academicYear} onChange={(event) => setClassForm((prev) => ({ ...prev, academicYear: event.target.value }))} required />
          <button type="submit">Create Class</button>
        </form>

        <DataTable<ApiClassroom & { schoolName: string }>
          columns={[
            { key: 'name', label: 'Class' },
            { key: 'schoolName', label: 'School' },
            { key: 'courseCode', label: 'Course' },
            { key: 'teacherId', label: 'Teacher ID' },
          ]}
          rows={rosterRows}
        />
      </Card>
    </section>
  )
}
