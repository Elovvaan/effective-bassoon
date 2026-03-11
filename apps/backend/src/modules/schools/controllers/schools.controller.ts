import { Router } from 'express';

import { validateRequest } from '../../../common/validation/validate-request.js';
import { createSchoolSchema } from '../dto/create-school.dto.js';
import { SchoolRepository } from '../repositories/school.repository.js';
import { SchoolService } from '../services/school.service.js';

const repository = new SchoolRepository();
const service = new SchoolService(repository);

export const schoolsRouter = Router();

schoolsRouter.get('/', (_req, res) => {
  res.json(service.list());
});

schoolsRouter.post('/', validateRequest(createSchoolSchema), (req, res) => {
  res.status(201).json(service.create(req.body));
});
