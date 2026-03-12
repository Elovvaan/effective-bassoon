import { sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

import { createOptions } from '../k6.config.js';
import { login } from '../helpers/auth.js';
import { CREDENTIALS } from '../helpers/credentials.js';
import { apiGet } from '../helpers/request.js';
import { firstItem, parseJson, record } from '../helpers/workflow.js';

const districtDuration = new Trend('analytics_district_duration', true);
const schoolDuration = new Trend('analytics_school_duration', true);
const classDuration = new Trend('analytics_class_duration', true);
const analyticsErrorRate = new Rate('analytics_error_rate');

export const options = createOptions({
  analytics_district_duration: ['p(95)<300', 'p(99)<700'],
  analytics_school_duration: ['p(95)<350', 'p(99)<750'],
  analytics_class_duration: ['p(95)<400', 'p(99)<900'],
  analytics_error_rate: ['rate<0.001'],
});

export default function () {
  const auth = login(CREDENTIALS.districtAdmin);
  if (!auth.ok) {
    analyticsErrorRate.add(true);
    sleep(1);
    return;
  }

  const session = { token: auth.token, user: auth.user };

  const districtRes = apiGet('/analytics/summary', session, {
    query: { page: 1, pageSize: 25 },
    tags: { endpoint: 'analytics_district' },
  });
  record({ response: districtRes, latencyTrend: districtDuration, errorRate: analyticsErrorRate, name: 'analytics district' });

  const schoolsRes = apiGet('/schools', session, {
    query: { page: 1, pageSize: 10 },
    tags: { endpoint: 'analytics_school_lookup' },
  });
  const school = firstItem(parseJson(schoolsRes));

  const schoolRes = apiGet('/analytics/summary', session, {
    query: { page: 1, pageSize: 25, schoolId: school?.id || session.user.schoolId },
    tags: { endpoint: 'analytics_school' },
  });
  record({ response: schoolRes, latencyTrend: schoolDuration, errorRate: analyticsErrorRate, name: 'analytics school' });

  const classesRes = apiGet('/classes', session, {
    query: { page: 1, pageSize: 10, schoolId: school?.id || session.user.schoolId },
    tags: { endpoint: 'analytics_class_lookup' },
  });
  const classroom = firstItem(parseJson(classesRes));

  const classRes = apiGet('/analytics/summary', session, {
    query: {
      page: 1,
      pageSize: 25,
      schoolId: school?.id || session.user.schoolId,
      classroomId: classroom?.id,
    },
    tags: { endpoint: 'analytics_class' },
  });
  record({ response: classRes, latencyTrend: classDuration, errorRate: analyticsErrorRate, name: 'analytics class' });

  sleep(1);
}
