import http from 'k6/http';

import { DEFAULT_BASE_URL, DEFAULT_API_PREFIX } from '../k6.config.js';

const makeHeaders = (session, extraHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: session?.token ? `Bearer ${session.token}` : undefined,
    'x-user-id': session?.user?.id,
    'x-district-id': session?.user?.districtId,
    'x-school-id': session?.user?.schoolId,
    'x-role': session?.user?.role,
    ...extraHeaders,
  };

  Object.keys(headers).forEach((key) => {
    if (headers[key] === undefined || headers[key] === null || headers[key] === '') {
      delete headers[key];
    }
  });

  return headers;
};

const buildUrl = (path, query = {}) => {
  const search = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });

  const suffix = search.toString() ? `?${search.toString()}` : '';
  return `${DEFAULT_BASE_URL}${DEFAULT_API_PREFIX}${path}${suffix}`;
};

export const apiGet = (path, session, { query, tags, headers } = {}) =>
  http.get(buildUrl(path, query), {
    headers: makeHeaders(session, headers),
    tags,
  });

export const apiPost = (path, body, session, { tags, headers, query } = {}) =>
  http.post(buildUrl(path, query), JSON.stringify(body), {
    headers: makeHeaders(session, headers),
    tags,
  });
