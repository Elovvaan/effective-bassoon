export const DEFAULT_BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const DEFAULT_API_PREFIX = __ENV.API_PREFIX || '/api';
export const DEFAULT_VUS = Number(__ENV.VUS || 100);
export const DEFAULT_DURATION = __ENV.DURATION || '2m';

const parseStages = (input) =>
  (input || '30s:20,1m:100,30s:0')
    .split(',')
    .map((stage) => stage.trim())
    .filter(Boolean)
    .map((stage) => {
      const [duration, target] = stage.split(':');
      return { duration, target: Number(target) };
    });

export const createOptions = (thresholds = {}) => {
  const rampingEnabled = String(__ENV.RAMPING || 'false').toLowerCase() === 'true';
  const baseThresholds = {
    http_req_duration: ['p(95)<250', 'p(99)<500'],
    http_req_failed: ['rate<0.001'],
    ...thresholds,
  };

  if (rampingEnabled) {
    return {
      scenarios: {
        ramping: {
          executor: 'ramping-vus',
          startVUs: 1,
          gracefulRampDown: '15s',
          stages: parseStages(__ENV.RAMPING_STAGES),
        },
      },
      thresholds: baseThresholds,
    };
  }

  return {
    vus: DEFAULT_VUS,
    duration: DEFAULT_DURATION,
    thresholds: baseThresholds,
  };
};
