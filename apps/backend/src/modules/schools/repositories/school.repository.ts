import type { School } from '../school.types.js';

export class SchoolRepository {
  private readonly store = new Map<string, School>();

  create(data: Omit<School, 'id'>): School {
    const id = crypto.randomUUID();
    const item: School = { id, ...data };
    this.store.set(id, item);
    return item;
  }

  findAll(): School[] {
    return Array.from(this.store.values());
  }
}
