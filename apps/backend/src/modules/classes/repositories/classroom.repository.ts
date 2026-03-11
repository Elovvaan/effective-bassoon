import type { Classroom } from '../classroom.types.js';

export class ClassroomRepository {
  private readonly store = new Map<string, Classroom>();

  create(data: Omit<Classroom, 'id'>): Classroom {
    const id = crypto.randomUUID();
    const item: Classroom = { id, ...data };
    this.store.set(id, item);
    return item;
  }

  findAll(): Classroom[] {
    return Array.from(this.store.values());
  }
}
