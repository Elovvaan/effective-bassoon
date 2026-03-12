import { sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

import { createOptions } from '../k6.config.js';
import { login } from '../helpers/auth.js';
import { CREDENTIALS } from '../helpers/credentials.js';

const loginSuccessRate = new Rate('login_success_rate');
const loginErrorRate = new Rate('login_error_rate');
const loginDuration = new Trend('login_duration', true);

export const options = createOptions({
  login_duration: ['p(95)<250', 'p(99)<500'],
  login_error_rate: ['rate<0.001'],
  login_success_rate: ['rate>0.999'],
});

const roles = [
  CREDENTIALS.districtAdmin,
  CREDENTIALS.schoolAdmin,
  CREDENTIALS.teacher,
  CREDENTIALS.student,
];

export default function () {
  const role = roles[__VU % roles.length];
  const result = login(role);

  loginDuration.add(result.response.timings.duration, { role: role.role });
  loginSuccessRate.add(result.ok, { role: role.role });
  loginErrorRate.add(!result.ok, { role: role.role });

  sleep(1);
}
