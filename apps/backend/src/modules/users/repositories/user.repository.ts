import type { ApiUser } from '@packages/types';
import { store } from '../../_store.js';

export class UserRepository {
  create(user: ApiUser) { store.users.set(user.id, user); return user; }
  update(id: string, patch: Partial<ApiUser>) { const found = store.users.get(id); if (!found) return null; const next = { ...found, ...patch }; store.users.set(id, next); return next; }
  delete(id: string) { return store.users.delete(id); }
  findById(id: string) { return store.users.get(id) ?? null; }
  findAll() { return Array.from(store.users.values()); }
  findByEmail(districtId: string, email: string) { return this.findAll().find((u) => u.districtId === districtId && u.email === email) ?? null; }
}
