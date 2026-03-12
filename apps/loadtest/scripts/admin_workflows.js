import { sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

import { createOptions } from '../k6.config.js';
import { login } from '../helpers/auth.js';
import { CREDENTIALS } from '../helpers/credentials.js';
import { apiGet } from '../helpers/request.js';
import { firstItem, parseJson, record } from '../helpers/workflow.js';

const usersDuration = new Trend('admin_users_duration', true);
const schoolsDuration = new Trend('admin_schools_duration', true);
const classesDuration = new Trend('admin_classes_duration', true);
const rosterDuration = new Trend('admin_roster_duration', true);
const workflowErrorRate = new Rate('admin_workflow_error_rate');

export const options = createOptions({
  admin_users_duration: ['p(95)<250', 'p(99)<500'],
  admin_schools_duration: ['p(95)<250', 'p(99)<500'],
  admin_classes_duration: ['p(95)<250', 'p(99)<500'],
  admin_roster_duration: ['p(95)<250', 'p(99)<500'],
  admin_workflow_error_rate: ['rate<0.001'],
});

const adminCreds = [CREDENTIALS.districtAdmin, CREDENTIALS.schoolAdmin];

export default function () {
  const selected = adminCreds[__VU % adminCreds.length];
  const auth = login(selected);
  if (!auth.ok) {
    workflowErrorRate.add(true);
    sleep(1);
    return;
  }

  const session = { token: auth.token, user: auth.user };

  const usersRes = apiGet('/users', session, {
    query: { page: 1, pageSize: 50, schoolId: session.user.schoolId },
    tags: { endpoint: 'admin_users' },
  });
  record({ response: usersRes, latencyTrend: usersDuration, errorRate: workflowErrorRate, name: 'admin users' });

  const schoolsRes = apiGet('/schools', session, {
    query: { page: 1, pageSize: 50 },
    tags: { endpoint: 'admin_schools' },
  });
  record({ response: schoolsRes, latencyTrend: schoolsDuration, errorRate: workflowErrorRate, name: 'admin schools' });

  const school = firstItem(parseJson(schoolsRes));
  const classesRes = apiGet('/classes', session, {
    query: { page: 1, pageSize: 50, schoolId: session.user.schoolId || school?.id },
    tags: { endpoint: 'admin_classes' },
  });
  record({ response: classesRes, latencyTrend: classesDuration, errorRate: workflowErrorRate, name: 'admin classes' });

  const rosterRes = apiGet('/users', session, {
    query: { page: 1, pageSize: 100, role: 'student', schoolId: session.user.schoolId || school?.id },
    tags: { endpoint: 'admin_roster' },
  });
  record({ response: rosterRes, latencyTrend: rosterDuration, errorRate: workflowErrorRate, name: 'admin roster' });

  sleep(1);
}
