import { store } from '../../_store.js';
export class AnalyticsRepository {
  listUsers() { return Array.from(store.users.values()); }
  listSubmissions() { return Array.from(store.submissions.values()); }
}
