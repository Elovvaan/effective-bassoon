import type { Assignment } from '../assignment.types.js';

export class AssignmentRepository {
  private readonly store = new Map<string, Assignment>();

  create(data: Omit<Assignment, 'id'>): Assignment {
    const id = crypto.randomUUID();
    const item: Assignment = { id, ...data };
    this.store.set(id, item);
    return item;
  }

  findAll(): Assignment[] {
    return Array.from(this.store.values());
  }
}
