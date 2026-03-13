import { describe, expect, it } from 'vitest';
import { canAccessAnalytics, hasPermission } from '../../src/auth';

describe('auth RBAC', () => {
  it('allows admins to manage users', () => {
    expect(hasPermission('admin', 'manage:users')).toBe(true);
  });

  it('disallows students from viewing analytics', () => {
    expect(canAccessAnalytics('student')).toBe(false);
  });
});
