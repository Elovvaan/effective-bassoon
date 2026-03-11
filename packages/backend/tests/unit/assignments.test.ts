import { describe, expect, it } from 'vitest';
import { AssignmentService } from '../../src/assignments';

describe('assignment service', () => {
  it('creates and filters assignments by assignee', () => {
    const service = new AssignmentService();
    service.assign('a1', 'Write report', 'student-1');
    service.assign('a2', 'Build demo', 'student-2');

    expect(service.listByAssignee('student-1')).toHaveLength(1);
  });

  it('marks assignments as complete', () => {
    const service = new AssignmentService();
    service.assign('a1', 'Write report', 'student-1');

    const assignment = service.complete('a1');
    expect(assignment?.completed).toBe(true);
  });
});
