import type { User } from '../user.types.js';

export class UserRepository {
  private readonly store = new Map<string, User>();

  create(data: Omit<User, 'id'>): User {
    const id = crypto.randomUUID();
    const item: User = { id, ...data };
    this.store.set(id, item);
    return item;
  }

  findAll(): User[] {
    return Array.from(this.store.values());
  }
}
