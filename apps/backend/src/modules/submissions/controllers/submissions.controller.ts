import { Router } from 'express';

import { validateRequest } from '../../../common/validation/validate-request.js';
import { createSubmissionSchema } from '../dto/create-submission.dto.js';
import { SubmissionRepository } from '../repositories/submission.repository.js';
import { SubmissionService } from '../services/submission.service.js';

const repository = new SubmissionRepository();
const service = new SubmissionService(repository);

export const submissionsRouter = Router();

submissionsRouter.get('/', (_req, res) => {
  res.json(service.list());
});

submissionsRouter.post('/', validateRequest(createSubmissionSchema), (req, res) => {
  res.status(201).json(service.create(req.body));
});
