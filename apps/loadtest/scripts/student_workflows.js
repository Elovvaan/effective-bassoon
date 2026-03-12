import { sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

import { createOptions } from '../k6.config.js';
import { login } from '../helpers/auth.js';
import { CREDENTIALS } from '../helpers/credentials.js';
import { apiGet, apiPost } from '../helpers/request.js';
import { firstItem, parseJson, record } from '../helpers/workflow.js';

const assignmentsDuration = new Trend('student_assignments_duration', true);
const submissionWriteDuration = new Trend('student_submit_duration', true);
const statusDuration = new Trend('student_status_duration', true);
const workflowErrorRate = new Rate('student_workflow_error_rate');

export const options = createOptions({
  student_assignments_duration: ['p(95)<250', 'p(99)<500'],
  student_submit_duration: ['p(95)<350', 'p(99)<700'],
  student_status_duration: ['p(95)<250', 'p(99)<500'],
  student_workflow_error_rate: ['rate<0.001'],
});

export default function () {
  const auth = login(CREDENTIALS.student);
  if (!auth.ok) {
    workflowErrorRate.add(true);
    sleep(1);
    return;
  }

  const session = { token: auth.token, user: auth.user };

  const assignmentsRes = apiGet('/assignments', session, {
    query: { studentId: session.user.id, page: 1, pageSize: 20 },
    tags: { endpoint: 'student_assignments' },
  });
  record({ response: assignmentsRes, latencyTrend: assignmentsDuration, errorRate: workflowErrorRate, name: 'student assignments' });

  const assignment = firstItem(parseJson(assignmentsRes));

  if (assignment?.id && assignment?.classroomId) {
    const submitRes = apiPost(
      '/submissions',
      {
        schoolId: session.user.schoolId,
        classroomId: assignment.classroomId,
        assignmentId: assignment.id,
        studentId: session.user.id,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
      },
      session,
      { tags: { endpoint: 'student_submit' } },
    );
    record({ response: submitRes, latencyTrend: submissionWriteDuration, errorRate: workflowErrorRate, name: 'student submit' });
  }

  const statusRes = apiGet('/submissions', session, {
    query: { studentId: session.user.id, page: 1, pageSize: 20 },
    tags: { endpoint: 'student_status' },
  });
  record({ response: statusRes, latencyTrend: statusDuration, errorRate: workflowErrorRate, name: 'student status' });

  sleep(1);
}
