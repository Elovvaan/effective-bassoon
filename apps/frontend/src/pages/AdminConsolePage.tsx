import type { AssignmentSummary, ClassRosterItem, DashboardCardMetric } from '@packages/types'

const metrics: DashboardCardMetric[] = [
  { label: 'Active Schools', value: 12 },
  { label: 'Managed Users', value: 1846 },
  { label: 'Classes', value: 233 },
  { label: 'Policies', value: 5, helper: '2 pending review' },
]

const recentClasses: Array<{ id: string; name: string; teacher: string; rosterSize: number }> = [
  { id: 'c-1', name: 'ELA Grade 7', teacher: 'Ms. Suarez', rosterSize: 28 },
  { id: 'c-2', name: 'ELA Grade 8', teacher: 'Mr. Carter', rosterSize: 31 },
]

const rosterPreview: ClassRosterItem[] = [
  { id: 's-1', studentName: 'Ava Brooks', status: 'active', lastSubmissionAt: '2026-03-08' },
  { id: 's-2', studentName: 'Noah Diaz', status: 'late', lastSubmissionAt: '2026-03-01' },
]

const policyAssignments: AssignmentSummary[] = [
  { id: 'p-1', title: 'Default Writing Window', dueDate: '2026-03-31', status: 'assigned' },
  { id: 'p-2', title: 'Late Submission Grace', dueDate: '2026-04-05', status: 'draft' },
]

export function AdminConsolePage() {
  return (
    <section>
      <h1>Admin Console</h1>
      <p>Manage users, schools, classes, roster quality, and policy windows.</p>

      <h2>District Snapshot</h2>
      <ul>
        {metrics.map((metric) => (
          <li key={metric.label}>
            <strong>{metric.label}:</strong> {metric.value} {metric.helper ? `(${metric.helper})` : ''}
          </li>
        ))}
      </ul>

      <h2>School and Class Management</h2>
      <ul>
        {recentClasses.map((classroom) => (
          <li key={classroom.id}>
            {classroom.name} — {classroom.teacher} ({classroom.rosterSize} students)
          </li>
        ))}
      </ul>

      <h2>Roster Health</h2>
      <ul>
        {rosterPreview.map((row) => (
          <li key={row.id}>
            {row.studentName} — {row.status} {row.lastSubmissionAt ? `(${row.lastSubmissionAt})` : ''}
          </li>
        ))}
      </ul>

      <h2>Policy Configuration</h2>
      <ul>
        {policyAssignments.map((policy) => (
          <li key={policy.id}>
            {policy.title} — {policy.status} (target date: {policy.dueDate})
          </li>
        ))}
      </ul>
    </section>
  )
}
