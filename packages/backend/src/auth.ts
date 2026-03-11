export type Role = 'admin' | 'instructor' | 'student';

const permissions: Record<Role, string[]> = {
  admin: ['manage:users', 'manage:assignments', 'view:analytics'],
  instructor: ['manage:assignments', 'view:analytics'],
  student: ['view:assignments']
};

export const hasPermission = (role: Role, permission: string): boolean =>
  permissions[role].includes(permission);

export const canAccessAnalytics = (role: Role): boolean => hasPermission(role, 'view:analytics');
