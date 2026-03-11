import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';

describe('backend integration: auth/rbac, assignments, analytics', () => {
  it('enforces RBAC on analytics and supports assignment workflows', async () => {
    const app = createApp();

    const created = await request(app)
      .post('/assignments')
      .send({ id: 'x1', title: 'Integration Task', assigneeId: 'learner-1' });
    expect(created.status).toBe(201);

    const studentAnalytics = await request(app)
      .get('/analytics/assignments')
      .set('x-role', 'student');
    expect(studentAnalytics.status).toBe(403);

    const instructorAnalytics = await request(app)
      .get('/analytics/assignments')
      .set('x-role', 'instructor');
    expect(instructorAnalytics.status).toBe(200);
    expect(instructorAnalytics.body.total).toBe(1);

    const assignments = await request(app).get('/assignments/learner-1');
    expect(assignments.status).toBe(200);
    expect(assignments.body).toHaveLength(1);

    const authCheck = await request(app).get('/auth/check').set('x-role', 'admin');
    expect(authCheck.body.canViewAnalytics).toBe(true);
  });
});
