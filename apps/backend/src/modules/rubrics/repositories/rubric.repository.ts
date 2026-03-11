import type { Rubric } from '../rubric.types.js';

export class RubricRepository {
  private readonly store = new Map<string, Rubric>();

  create(data: Omit<Rubric, 'id'>): Rubric {
    const id = crypto.randomUUID();
    const item: Rubric = { id, ...data };
    this.store.set(id, item);
    return item;
  }

  findAll(): Rubric[] {
    return Array.from(this.store.values());
  }
}
