import { Router } from 'express';

import { validateRequest } from '../../../common/validation/validate-request.js';
import { createRubricSchema } from '../dto/create-rubric.dto.js';
import { RubricRepository } from '../repositories/rubric.repository.js';
import { RubricService } from '../services/rubric.service.js';

const repository = new RubricRepository();
const service = new RubricService(repository);

export const rubricsRouter = Router();

rubricsRouter.get('/', (_req, res) => {
  res.json(service.list());
});

rubricsRouter.post('/', validateRequest(createRubricSchema), (req, res) => {
  res.status(201).json(service.create(req.body));
});
