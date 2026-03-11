import type { ApiAuditLog } from '@packages/types'; import { store } from '../../_store.js';
export class AuditRepository { create(v:ApiAuditLog){store.audits.set(v.id,v);return v;} findAll(){return Array.from(store.audits.values());} }
