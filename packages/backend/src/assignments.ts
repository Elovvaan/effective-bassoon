export interface Assignment {
  id: string;
  title: string;
  assigneeId: string;
  completed: boolean;
}

export class AssignmentService {
  private assignments: Assignment[] = [];

  assign(id: string, title: string, assigneeId: string): Assignment {
    const assignment: Assignment = { id, title, assigneeId, completed: false };
    this.assignments.push(assignment);
    return assignment;
  }

  complete(id: string): Assignment | undefined {
    const assignment = this.assignments.find((item) => item.id === id);
    if (!assignment) {
      return undefined;
    }

    assignment.completed = true;
    return assignment;
  }

  listByAssignee(assigneeId: string): Assignment[] {
    return this.assignments.filter((item) => item.assigneeId === assigneeId);
  }

  all(): Assignment[] {
    return [...this.assignments];
  }
}
