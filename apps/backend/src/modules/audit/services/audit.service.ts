import type { QueryAuditDto } from '../dto/query-audit.dto.js';
import { AuditRepository } from '../repositories/audit.repository.js';

export class AuditService {
  constructor(private readonly repository: AuditRepository) {}

  list(dto: QueryAuditDto) {
    return this.repository.list(dto.limit);
  }
}
