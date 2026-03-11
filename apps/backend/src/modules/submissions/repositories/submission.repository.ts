import type { Submission } from '../submission.types.js';

export class SubmissionRepository {
  private readonly store = new Map<string, Submission>();

  create(data: Omit<Submission, 'id'>): Submission {
    const id = crypto.randomUUID();
    const item: Submission = { id, ...data };
    this.store.set(id, item);
    return item;
  }

  findAll(): Submission[] {
    return Array.from(this.store.values());
  }
}
