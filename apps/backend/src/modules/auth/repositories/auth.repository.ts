import { store } from '../../_store.js';
export class AuthRepository {
  findUserByEmail(email: string) { return Array.from(store.users.values()).find((u) => u.email === email) ?? null; }
}
