import type { AssignmentSummary } from '@packages/types'

const activeAssignments: AssignmentSummary[] = [
  { id: 'as-1', title: 'Poetry Analysis', dueDate: '2026-03-18', status: 'assigned' },
  { id: 'as-2', title: 'Research Reflection', dueDate: '2026-03-21', status: 'submitted', score: 87, feedback: 'Great evidence and structure.' },
]

const announcements = [
  'Library writing lab is open Tuesday and Thursday after school.',
  'Revision checkpoint due by Friday at 5:00 PM.',
]

export function StudentPortalPage() {
  return (
    <section>
      <h1>Student Portal</h1>
      <p>View active work, review feedback, and keep up with classroom announcements.</p>

      <h2>Assignments</h2>
      <ul>
        {activeAssignments.map((assignment) => (
          <li key={assignment.id}>
            {assignment.title} — {assignment.status} (due {assignment.dueDate})
            {assignment.score ? ` | score ${assignment.score}` : ''}
            {assignment.feedback ? ` | feedback: ${assignment.feedback}` : ''}
          </li>
        ))}
      </ul>

      <h2>Announcements</h2>
      <ul>
        {announcements.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  )
}
