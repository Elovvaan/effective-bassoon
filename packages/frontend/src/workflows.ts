export type Role = 'admin' | 'instructor' | 'student';

export interface WorkflowState {
  landingPage: string;
  actions: string[];
}

export const getWorkflowState = (role: Role): WorkflowState => {
  switch (role) {
    case 'admin':
      return {
        landingPage: '/admin/overview',
        actions: ['manage-users', 'view-analytics', 'manage-assignments']
      };
    case 'instructor':
      return {
        landingPage: '/instructor/classes',
        actions: ['create-assignment', 'grade-submissions', 'view-analytics']
      };
    case 'student':
      return {
        landingPage: '/student/home',
        actions: ['view-assignments', 'submit-work']
      };
  }
};
