import { Router } from 'express';
import { asyncHandler } from '../../../common/http/async-handler.js';
import { getRequestContext, requireRoles } from '../../../common/auth/request-context.js';
import { validateRequest } from '../../../common/validation/validate-request.js';
import { createUserSchema, listUsersSchema, updateUserSchema } from '../dto/create-user.dto.js';
import { UserRepository } from '../repositories/user.repository.js';
import { UserService } from '../services/user.service.js';

const service = new UserService(new UserRepository());
export const usersRouter = Router();
usersRouter.get('/', requireRoles(['district_admin', 'school_admin']), asyncHandler(async (req, res) => {
  const query = listUsersSchema.parse(req.query);
  res.json(service.list(getRequestContext(req), query));
}));
usersRouter.get('/:id', asyncHandler(async (req, res) => { res.json(service.getById(getRequestContext(req), req.params.id)); }));
usersRouter.post('/', requireRoles(['district_admin', 'school_admin']), validateRequest(createUserSchema), asyncHandler(async (req, res) => { res.status(201).json(service.create(getRequestContext(req), req.body)); }));
usersRouter.patch('/:id', requireRoles(['district_admin', 'school_admin']), validateRequest(updateUserSchema), asyncHandler(async (req, res) => { res.json(service.update(getRequestContext(req), req.params.id, req.body)); }));
usersRouter.delete('/:id', requireRoles(['district_admin']), asyncHandler(async (req, res) => { service.remove(getRequestContext(req), req.params.id); res.status(204).send(); }));
