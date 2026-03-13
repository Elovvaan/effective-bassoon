import { describe, expect, it } from 'vitest';
import { summarizeAssignments } from '../../src/analytics';

describe('assignment analytics', () => {
  it('computes completion metrics', () => {
    const result = summarizeAssignments([
      { id: 'a1', title: 'One', assigneeId: 'u1', completed: true },
      { id: 'a2', title: 'Two', assigneeId: 'u1', completed: false }
    ]);

    expect(result).toEqual({ total: 2, completed: 1, completionRate: 0.5 });
  });
});
