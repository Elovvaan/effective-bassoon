export type UserRole = 'district_admin' | 'school_admin' | 'teacher' | 'student'

export interface UserSession {
  token: string
  user: { id: string; name: string; role: UserRole; schoolId?: string; districtId?: string }
}

export interface PaginationQuery {
  page?: number
  pageSize?: number
  search?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiUser {
  id: string
  districtId: string
  schoolId?: string
  role: UserRole
  email: string
  firstName: string
  lastName: string
  isActive: boolean
}

export interface ApiSchool {
  id: string
  districtId: string
  name: string
  code: string
  timezone?: string
}

export interface ApiClassroom {
  id: string
  districtId: string
  schoolId: string
  teacherId: string
  name: string
  courseCode: string
  academicYear: string
  term?: string
  period?: string
}

export interface ApiAssignment {
  id: string
  districtId: string
  schoolId: string
  classroomId: string
  creatorId: string
  rubricId?: string
  title: string
  description?: string
  dueAt?: string
  maxPoints?: number
}

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'GRADED'

export interface ApiSubmission {
  id: string
  districtId: string
  schoolId: string
  classroomId: string
  assignmentId: string
  studentId: string
  status: SubmissionStatus
  submittedAt?: string
  gradedAt?: string
}

export interface ApiRubricCriterion {
  title: string
  description?: string
  maxScore: number
  weight: number
  displayOrder: number
}

export interface ApiRubric {
  id: string
  districtId: string
  schoolId?: string
  name: string
  description?: string
  version: number
  criteria: ApiRubricCriterion[]
}

export interface ApiAuditLog {
  id: string
  districtId: string
  schoolId?: string
  actorUserId?: string
  entityType: string
  entityId: string
  action: string
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface AnalyticsSummary {
  scope: 'class' | 'school' | 'district'
  activeUsers: number
  completionRate: number
  averageScore: number
}

export interface DashboardCardMetric {
  label: string
  value: string | number
  helper?: string
}

export interface ColumnDefinition<T> {
  key: keyof T
  label: string
}

export interface CreateUserInput {
  schoolId?: string
  role: UserRole
  email: string
  firstName: string
  lastName: string
  isActive?: boolean
}

export interface CreateSchoolInput {
  name: string
  code: string
  timezone?: string
}

export interface CreateClassroomInput {
  schoolId: string
  teacherId: string
  name: string
  courseCode: string
  academicYear: string
  term?: string
  period?: string
}

export interface CreateAssignmentInput {
  schoolId: string
  classroomId: string
  rubricId?: string
  title: string
  description?: string
  dueAt?: string
  maxPoints?: number
}

export interface CreateSubmissionInput {
  schoolId: string
  classroomId: string
  assignmentId: string
  studentId: string
  status?: SubmissionStatus
  submittedAt?: string
  gradedAt?: string
}
