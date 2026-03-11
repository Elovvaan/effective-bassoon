import { Router } from 'express';

import { validateRequest } from '../../../common/validation/validate-request.js';
import { createAssignmentSchema } from '../dto/create-assignment.dto.js';
import { AssignmentRepository } from '../repositories/assignment.repository.js';
import { AssignmentService } from '../services/assignment.service.js';

const repository = new AssignmentRepository();
const service = new AssignmentService(repository);

export const assignmentsRouter = Router();

assignmentsRouter.get('/', (_req, res) => {
  res.json(service.list());
});

assignmentsRouter.post('/', validateRequest(createAssignmentSchema), (req, res) => {
  res.status(201).json(service.create(req.body));
});
