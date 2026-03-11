import type {
  AnalyticsSummary,
  ApiAssignment,
  ApiClassroom,
  ApiSchool,
  ApiSubmission,
  ApiUser,
  CreateAssignmentInput,
  CreateClassroomInput,
  CreateSchoolInput,
  CreateSubmissionInput,
  CreateUserInput,
  UserRole,
} from '@packages/types'

import type { Session } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

interface RequestOptions extends RequestInit {
  session?: Session
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { session, headers, ...rest } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(session
        ? {
            Authorization: `Bearer ${session.token}`,
            'x-user-id': session.user.id,
            'x-district-id': session.user.districtId ?? 'district-default',
            'x-school-id': session.user.schoolId ?? '',
            'x-role': session.user.role,
          }
        : {}),
      ...headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  accessToken: string
  user: Session['user']
}

export const apiClient = {
  login: async (payload: LoginPayload): Promise<Session> => {
    const response = await request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    return {
      token: response.accessToken,
      user: response.user,
    }
  },
  listUsers: (session: Session) => request<{ items: ApiUser[] }>('/users', { session }),
  createUser: (session: Session, payload: CreateUserInput) => request<ApiUser>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
    session,
  }),
  updateUser: (session: Session, id: string, payload: Partial<CreateUserInput>) => request<ApiUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    session,
  }),
  listSchools: (session: Session) => request<{ items: ApiSchool[] }>('/schools', { session }),
  createSchool: (session: Session, payload: CreateSchoolInput) => request<ApiSchool>('/schools', {
    method: 'POST',
    body: JSON.stringify(payload),
    session,
  }),
  updateSchool: (session: Session, id: string, payload: Partial<CreateSchoolInput>) => request<ApiSchool>(`/schools/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    session,
  }),
  listClasses: (session: Session) => request<{ items: ApiClassroom[] }>('/classes', { session }),
  createClass: (session: Session, payload: CreateClassroomInput) => request<ApiClassroom>('/classes', {
    method: 'POST',
    body: JSON.stringify(payload),
    session,
  }),
  listAssignments: (session: Session) => request<{ items: ApiAssignment[] }>('/assignments', { session }),
  createAssignment: (session: Session, payload: CreateAssignmentInput) => request<ApiAssignment>('/assignments', {
    method: 'POST',
    body: JSON.stringify(payload),
    session,
  }),
  listSubmissions: (session: Session) => request<{ items: ApiSubmission[] }>('/submissions', { session }),
  createSubmission: (session: Session, payload: CreateSubmissionInput) => request<ApiSubmission>('/submissions', {
    method: 'POST',
    body: JSON.stringify(payload),
    session,
  }),
  getAnalytics: (session: Session) => request<AnalyticsSummary>('/analytics/summary', { session }),
}

export const roleOptions: UserRole[] = ['district_admin', 'school_admin', 'teacher', 'student']
