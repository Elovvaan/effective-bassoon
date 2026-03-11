import type { Session, UserRole } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

interface RequestOptions extends RequestInit {
  token?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export interface LoginPayload {
  username: string
  password: string
  role: UserRole
}

export const apiClient = {
  login: (payload: LoginPayload) => request<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  getAnalytics: (token: string) => request<{ activeUsers: number; completionRate: number }>(
    '/analytics/overview',
    { token },
  ),
}
