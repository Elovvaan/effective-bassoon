import type { Assignment } from './assignments';

export interface AssignmentAnalytics {
  total: number;
  completed: number;
  completionRate: number;
}

export const summarizeAssignments = (assignments: Assignment[]): AssignmentAnalytics => {
  const total = assignments.length;
  const completed = assignments.filter((item) => item.completed).length;

  return {
    total,
    completed,
    completionRate: total === 0 ? 0 : Number((completed / total).toFixed(2))
  };
};
