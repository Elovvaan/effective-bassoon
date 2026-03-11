import { Router } from 'express';

import { validateRequest } from '../../../common/validation/validate-request.js';
import { createUserSchema } from '../dto/create-user.dto.js';
import { UserRepository } from '../repositories/user.repository.js';
import { UserService } from '../services/user.service.js';

const repository = new UserRepository();
const service = new UserService(repository);

export const usersRouter = Router();

usersRouter.get('/', (_req, res) => {
  res.json(service.list());
});

usersRouter.post('/', validateRequest(createUserSchema), (req, res) => {
  res.status(201).json(service.create(req.body));
});
