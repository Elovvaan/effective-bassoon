const test = require('node:test');
const assert = require('node:assert/strict');

const { Roles, authorizeResourceAccess, hasRequiredRole } = require('../src/auth/authorization');

test('district admin can access district resources only', () => {
  const user = { id: 'a1', role: Roles.DISTRICT_ADMIN, districtId: 'd1' };
  assert.equal(authorizeResourceAccess(user, { districtId: 'd1' }), true);
  assert.equal(authorizeResourceAccess(user, { districtId: 'd2' }), false);
});

test('teacher can only access their school and teacher-scoped resources', () => {
  const user = {
    id: 't1',
    role: Roles.TEACHER,
    districtId: 'd1',
    schoolId: 's1',
  };

  assert.equal(authorizeResourceAccess(user, { districtId: 'd1', schoolId: 's1', teacherId: 't1' }), true);
  assert.equal(authorizeResourceAccess(user, { districtId: 'd1', schoolId: 's2', teacherId: 't1' }), false);
  assert.equal(authorizeResourceAccess(user, { districtId: 'd1', schoolId: 's1', teacherId: 't2' }), false);
});

test('parent can only access children student resources', () => {
  const user = {
    id: 'p1',
    role: Roles.PARENT,
    districtId: 'd1',
    schoolId: 's1',
    childrenStudentIds: ['st1', 'st2'],
  };

  assert.equal(authorizeResourceAccess(user, { districtId: 'd1', schoolId: 's1', studentId: 'st1' }), true);
  assert.equal(authorizeResourceAccess(user, { districtId: 'd1', schoolId: 's1', studentId: 'st9' }), false);
});

test('hasRequiredRole checks included roles', () => {
  const user = { id: 'x1', role: Roles.SCHOOL_ADMIN };
  assert.equal(hasRequiredRole(user, [Roles.DISTRICT_ADMIN, Roles.SCHOOL_ADMIN]), true);
  assert.equal(hasRequiredRole(user, [Roles.TEACHER]), false);
});
