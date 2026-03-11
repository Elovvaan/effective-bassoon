import { useMemo, useState } from 'react'
import type { ApiAssignment, ApiSubmission, CreateSubmissionInput } from '@packages/types'
import { Card, DataTable, EmptyState } from '@packages/ui'

import { apiClient } from '../api/client'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { useRoleGuard } from '../hooks/useRoleGuard'

export function StudentPortalPage() {
  const { session } = useAuth()
  const { canAccess } = useRoleGuard(['student'])

  const assignmentsApi = useApi(async () => (session ? apiClient.listAssignments(session) : { items: [] }), [session])
  const submissionsApi = useApi(async () => (session ? apiClient.listSubmissions(session) : { items: [] }), [session])

  const [submissionForm, setSubmissionForm] = useState<CreateSubmissionInput>({
    schoolId: session?.user.schoolId ?? '',
    classroomId: '',
    assignmentId: '',
    studentId: session?.user.id ?? '',
    status: 'SUBMITTED',
  })

  const mySubmissions = useMemo(() => (submissionsApi.data?.items ?? []).filter((item) => item.studentId === session?.user.id), [session?.user.id, submissionsApi.data?.items])
  const activeAssignments = useMemo(() => {
    const submittedIds = new Set(mySubmissions.map((item) => item.assignmentId))
    return (assignmentsApi.data?.items ?? []).filter((assignment) => !submittedIds.has(assignment.id))
  }, [assignmentsApi.data?.items, mySubmissions])

  async function submitWork() {
    if (!session) return
    await apiClient.createSubmission(session, {
      ...submissionForm,
      submittedAt: new Date().toISOString(),
      studentId: session.user.id,
      schoolId: session.user.schoolId ?? submissionForm.schoolId,
    })
    await submissionsApi.reload()
  }

  if (!canAccess) {
    return <EmptyState message="Student access required." />
  }

  return (
    <section>
      <h1>Student Portal</h1>

      <Card title="Active Assignments">
        <DataTable<ApiAssignment>
          columns={[
            { key: 'title', label: 'Assignment' },
            { key: 'description', label: 'Description' },
            { key: 'dueAt', label: 'Due Date' },
          ]}
          rows={activeAssignments}
          emptyLabel="You are all caught up."
        />
      </Card>

      <Card title="Submit Work">
        <form onSubmit={(event) => { event.preventDefault(); void submitWork() }}>
          <select value={submissionForm.assignmentId} onChange={(event) => setSubmissionForm((prev) => ({ ...prev, assignmentId: event.target.value }))} required>
            <option value="">Choose assignment</option>
            {activeAssignments.map((assignment) => <option key={assignment.id} value={assignment.id}>{assignment.title}</option>)}
          </select>
          <select value={submissionForm.classroomId} onChange={(event) => setSubmissionForm((prev) => ({ ...prev, classroomId: event.target.value }))} required>
            <option value="">Choose class ID</option>
            {(assignmentsApi.data?.items ?? []).map((assignment) => <option key={assignment.classroomId} value={assignment.classroomId}>{assignment.classroomId}</option>)}
          </select>
          <button type="submit">Submit Assignment</button>
        </form>
      </Card>

      <Card title="Grades and Feedback">
        <DataTable<ApiSubmission>
          columns={[
            { key: 'assignmentId', label: 'Assignment ID' },
            { key: 'status', label: 'Status' },
            { key: 'submittedAt', label: 'Submitted At' },
            { key: 'gradedAt', label: 'Graded At' },
          ]}
          rows={mySubmissions}
          emptyLabel="No submissions yet."
        />
      </Card>
    </section>
  )
}
