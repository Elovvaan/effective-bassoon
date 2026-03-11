import { describe, expect, it } from 'vitest';
import { getWorkflowState } from '../src/workflows';

describe('role workflows', () => {
  it('returns admin workflow actions', () => {
    const workflow = getWorkflowState('admin');
    expect(workflow.actions).toContain('manage-users');
    expect(workflow.landingPage).toBe('/admin/overview');
  });

  it('returns instructor workflow actions', () => {
    const workflow = getWorkflowState('instructor');
    expect(workflow.actions).toContain('create-assignment');
  });

  it('returns student workflow actions', () => {
    const workflow = getWorkflowState('student');
    expect(workflow.actions).toEqual(['view-assignments', 'submit-work']);
  });
});
