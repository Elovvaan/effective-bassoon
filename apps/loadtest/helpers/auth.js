import http from 'k6/http';
import { check } from 'k6';

import { DEFAULT_API_PREFIX, DEFAULT_BASE_URL } from '../k6.config.js';

const parseJson = (response) => {
  try {
    return response.json();
  } catch {
    return null;
  }
};

export const login = ({ email, password }) => {
  const response = http.post(
    `${DEFAULT_BASE_URL}${DEFAULT_API_PREFIX}/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { endpoint: 'auth_login' },
    },
  );

  const payload = parseJson(response);
  const ok = check(response, {
    'login status is 200': (r) => r.status === 200,
    'login returns token': () => Boolean(payload?.accessToken),
    'login returns user context': () => Boolean(payload?.user?.id && payload?.user?.districtId && payload?.user?.role),
  });

  return {
    ok,
    response,
    token: payload?.accessToken,
    user: payload?.user,
  };
};
