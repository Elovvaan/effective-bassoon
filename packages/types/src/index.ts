export type UserRole = 'district_admin' | 'school_admin' | 'teacher' | 'student';

export interface UserSession {
  token: string;
  user: {
    id: string;
    name: string;
    role: UserRole;
    schoolId?: string;
    districtId?: string;
  };
}

export interface DashboardCardMetric {
  label: string;
  value: string | number;
  helper?: string;
}

export interface ClassRosterItem {
  id: string;
  studentName: string;
  status: 'active' | 'missing' | 'late';
  lastSubmissionAt?: string;
}

export interface AssignmentSummary {
  id: string;
  title: string;
  dueDate: string;
  status: 'draft' | 'assigned' | 'submitted' | 'graded';
  score?: number;
  feedback?: string;
}

export interface AnalyticsSummary {
  scope: 'class' | 'school' | 'district';
  activeUsers: number;
  completionRate: number;
  averageScore: number;
}
