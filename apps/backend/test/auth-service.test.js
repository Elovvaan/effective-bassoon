const test = require('node:test');
const assert = require('node:assert/strict');

const { AuthService } = require('../src/auth/auth-service');
const { AuditService } = require('../src/auth/audit');

function buildUsers() {
  return [
    { id: 'u1', email: 'district@example.com', role: 'district_admin', districtId: 'd1', schoolId: null },
    { id: 'u2', email: 'teacher@example.com', role: 'teacher', districtId: 'd1', schoolId: 's1' },
  ];
}

test('login issues signed access token and refresh token', async () => {
  const users = buildUsers();
  const authService = new AuthService({
    jwtSecret: 'test-secret',
    validateCredentials: async (email, password) =>
      users.find((user) => user.email === email && password === 'secret') || null,
    findUserById: async (id) => users.find((user) => user.id === id) || null,
  });

  const session = await authService.login('teacher@example.com', 'secret');

  assert.ok(session.accessToken);
  assert.ok(session.refreshToken);
  assert.equal(session.user.id, 'u2');
  const claimsUser = authService.authenticateAccessToken(session.accessToken);
  assert.equal(claimsUser.id, 'u2');
  assert.equal(claimsUser.role, 'teacher');
});

test('refresh rotates token and prevents old token reuse', async () => {
  const users = buildUsers();
  const auditEvents = [];
  const authService = new AuthService({
    jwtSecret: 'test-secret',
    validateCredentials: async (email, password) =>
      users.find((user) => user.email === email && password === 'secret') || null,
    findUserById: async (id) => users.find((user) => user.id === id) || null,
    auditService: new AuditService({ sink: { info: (entry) => auditEvents.push(entry.audit) } }),
  });

  const session = await authService.login('teacher@example.com', 'secret');
  const refreshed = await authService.refresh(session.refreshToken);

  assert.ok(refreshed.accessToken);
  assert.notEqual(refreshed.refreshToken, session.refreshToken);

  const replayAttempt = await authService.refresh(session.refreshToken);
  assert.equal(replayAttempt, null);
  assert.equal(auditEvents.some((event) => event.action === 'refresh_failed'), true);
});

test('logout revokes refresh token', async () => {
  const users = buildUsers();
  const authService = new AuthService({
    jwtSecret: 'test-secret',
    validateCredentials: async (email, password) =>
      users.find((user) => user.email === email && password === 'secret') || null,
    findUserById: async (id) => users.find((user) => user.id === id) || null,
  });

  const session = await authService.login('teacher@example.com', 'secret');
  await authService.logout(session.refreshToken);
  const result = await authService.refresh(session.refreshToken);

  assert.equal(result, null);
});
