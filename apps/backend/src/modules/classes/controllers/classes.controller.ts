import { Router } from 'express';

import { validateRequest } from '../../../common/validation/validate-request.js';
import { createClassroomSchema } from '../dto/create-classroom.dto.js';
import { ClassroomRepository } from '../repositories/classroom.repository.js';
import { ClassroomService } from '../services/classroom.service.js';

const repository = new ClassroomRepository();
const service = new ClassroomService(repository);

export const classesRouter = Router();

classesRouter.get('/', (_req, res) => {
  res.json(service.list());
});

classesRouter.post('/', validateRequest(createClassroomSchema), (req, res) => {
  res.status(201).json(service.create(req.body));
});
