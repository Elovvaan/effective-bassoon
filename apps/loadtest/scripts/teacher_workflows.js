import { sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

import { createOptions } from '../k6.config.js';
import { login } from '../helpers/auth.js';
import { CREDENTIALS } from '../helpers/credentials.js';
import { apiGet } from '../helpers/request.js';
import { firstItem, parseJson, record } from '../helpers/workflow.js';

const classesDuration = new Trend('teacher_classes_duration', true);
const assignmentsDuration = new Trend('teacher_assignments_duration', true);
const submissionsDuration = new Trend('teacher_submissions_duration', true);
const workflowErrorRate = new Rate('teacher_workflow_error_rate');

export const options = createOptions({
  teacher_classes_duration: ['p(95)<250', 'p(99)<500'],
  teacher_assignments_duration: ['p(95)<250', 'p(99)<500'],
  teacher_submissions_duration: ['p(95)<300', 'p(99)<600'],
  teacher_workflow_error_rate: ['rate<0.001'],
});

export default function () {
  const auth = login(CREDENTIALS.teacher);
  if (!auth.ok) {
    workflowErrorRate.add(true);
    sleep(1);
    return;
  }

  const session = { token: auth.token, user: auth.user };

  const classesRes = apiGet('/classes', session, {
    query: { teacherId: session.user.id, page: 1, pageSize: 25 },
    tags: { endpoint: 'teacher_classes' },
  });
  record({ response: classesRes, latencyTrend: classesDuration, errorRate: workflowErrorRate, name: 'teacher classes' });

  const classroom = firstItem(parseJson(classesRes));
  const assignmentsRes = apiGet('/assignments', session, {
    query: { classroomId: classroom?.id, page: 1, pageSize: 25 },
    tags: { endpoint: 'teacher_assignments' },
  });
  record({ response: assignmentsRes, latencyTrend: assignmentsDuration, errorRate: workflowErrorRate, name: 'teacher assignments' });

  const assignment = firstItem(parseJson(assignmentsRes));
  const submissionsRes = apiGet('/submissions', session, {
    query: { assignmentId: assignment?.id, page: 1, pageSize: 50 },
    tags: { endpoint: 'teacher_submissions' },
  });
  record({ response: submissionsRes, latencyTrend: submissionsDuration, errorRate: workflowErrorRate, name: 'teacher submissions' });

  sleep(1);
}
