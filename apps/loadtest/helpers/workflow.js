import { check } from 'k6';

export const parseJson = (response) => {
  try {
    return response.json();
  } catch {
    return null;
  }
};

export const isSuccess = (response) => response.status >= 200 && response.status < 300;

export const record = ({ response, latencyTrend, errorRate, name }) => {
  if (latencyTrend) latencyTrend.add(response.timings.duration);
  if (errorRate) errorRate.add(!isSuccess(response));
  check(response, {
    [`${name} status is 2xx`]: isSuccess,
  });
};

export const firstItem = (payload) => {
  if (Array.isArray(payload)) return payload[0] || null;
  if (Array.isArray(payload?.items)) return payload.items[0] || null;
  return null;
};
