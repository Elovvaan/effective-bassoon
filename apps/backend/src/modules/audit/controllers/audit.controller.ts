import { Router } from 'express';

import { queryAuditSchema } from '../dto/query-audit.dto.js';
import { AuditRepository } from '../repositories/audit.repository.js';
import { AuditService } from '../services/audit.service.js';

const repository = new AuditRepository();
const service = new AuditService(repository);

export const auditRouter = Router();

auditRouter.get('/events', (req, res) => {
  const dto = queryAuditSchema.parse(req.query);
  res.json(service.list(dto));
});
