import { useMemo } from 'react'
import type { ApiAssignment, ApiClassroom, ApiSubmission } from '@packages/types'
import { Card, DataTable, EmptyState } from '@packages/ui'

import { apiClient } from '../api/client'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useRoleGuard } from '../hooks/useRoleGuard'

export function TeacherDashboardPage() {
  const { session } = useAuth()
  const { canAccess } = useRoleGuard(['teacher'])

  const classesApi = useApi(async () => (session ? apiClient.listClasses(session) : { items: [] }), [session])
  const assignmentsApi = useApi(async () => (session ? apiClient.listAssignments(session) : { items: [] }), [session])
  const submissionsApi = useApi(async () => (session ? apiClient.listSubmissions(session) : { items: [] }), [session])

  const myClasses = useMemo(
    () => (classesApi.data?.items ?? []).filter((classroom) => classroom.teacherId === session?.user.id),
    [classesApi.data?.items, session?.user.id],
  )
  const assignmentRows = (assignmentsApi.data?.items ?? []).filter((assignment) => myClasses.some((item) => item.id === assignment.classroomId))
  const submissionRows = (submissionsApi.data?.items ?? []).filter((submission) => assignmentRows.some((assignment) => assignment.id === submission.assignmentId))

  if (!canAccess) {
    return <EmptyState message="Teacher access required." />
  }

  return (
    <section data-testid="teacher-dashboard-page">
      <h1 data-testid="teacher-dashboard-title">Teacher Dashboard</h1>
      {classesApi.error || assignmentsApi.error || submissionsApi.error ? <p className="error">Unable to load teacher data.</p> : null}

      <Card title="My Classes">
        <div data-testid="teacher-classes-section">
          <DataTable<ApiClassroom>
            columns={[
              { key: 'name', label: 'Class Name' },
              { key: 'courseCode', label: 'Course' },
              { key: 'academicYear', label: 'Year' },
              { key: 'period', label: 'Period' },
            ]}
            rows={myClasses}
            emptyLabel="No classes assigned yet."
          />
        </div>
      </Card>

      <Card title="Assignments">
        <div data-testid="teacher-assignments-section">
          <DataTable<ApiAssignment>
            columns={[
              { key: 'title', label: 'Assignment' },
              { key: 'classroomId', label: 'Class ID' },
              { key: 'dueAt', label: 'Due Date' },
              { key: 'maxPoints', label: 'Points' },
            ]}
            rows={assignmentRows}
            emptyLabel="No assignments posted yet."
          />
        </div>
      </Card>

      <Card title="Submission Status">
        <div data-testid="teacher-submissions-section">
          <DataTable<ApiSubmission>
            columns={[
              { key: 'assignmentId', label: 'Assignment ID' },
              { key: 'studentId', label: 'Student ID' },
              { key: 'status', label: 'Status' },
              { key: 'submittedAt', label: 'Submitted' },
              { key: 'gradedAt', label: 'Graded' },
            ]}
            rows={submissionRows}
            emptyLabel="No submission activity yet."
          />
        </div>
      </Card>
    </section>
  )
}
