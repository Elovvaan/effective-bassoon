import type { AssignmentSummary, ClassRosterItem } from '@packages/types'

const myClasses = [
  { id: 'class-ela-7', name: 'ELA Grade 7', period: '2nd Period' },
  { id: 'class-ela-8', name: 'ELA Grade 8', period: '4th Period' },
]

const classRoster: ClassRosterItem[] = [
  { id: 'stu-11', studentName: 'Mia Chen', status: 'active', lastSubmissionAt: '2026-03-10' },
  { id: 'stu-12', studentName: 'Liam Patel', status: 'missing', lastSubmissionAt: '2026-03-04' },
  { id: 'stu-13', studentName: 'Elijah Gomez', status: 'late', lastSubmissionAt: '2026-03-02' },
]

const assignmentStatus: AssignmentSummary[] = [
  { id: 'a-11', title: 'Argumentative Essay', dueDate: '2026-03-15', status: 'assigned' },
  { id: 'a-12', title: 'Narrative Revision', dueDate: '2026-03-20', status: 'submitted' },
]

export function TeacherDashboardPage() {
  return (
    <section>
      <h1>Teacher Dashboard</h1>
      <p>Track classes, monitor submissions, and prioritize intervention.</p>

      <h2>My Classes</h2>
      <ul>
        {myClasses.map((classroom) => (
          <li key={classroom.id}>{classroom.name} — {classroom.period}</li>
        ))}
      </ul>

      <h2>Current Assignment Status</h2>
      <ul>
        {assignmentStatus.map((assignment) => (
          <li key={assignment.id}>
            {assignment.title} — {assignment.status} (due {assignment.dueDate})
          </li>
        ))}
      </ul>

      <h2>Roster and Recent Submissions</h2>
      <ul>
        {classRoster.map((student) => (
          <li key={student.id}>
            {student.studentName} — {student.status} {student.lastSubmissionAt ? `(${student.lastSubmissionAt})` : ''}
          </li>
        ))}
      </ul>
    </section>
  )
}
