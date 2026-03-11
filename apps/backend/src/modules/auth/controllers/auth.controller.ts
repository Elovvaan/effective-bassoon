import { Router } from 'express';

import { validateRequest } from '../../../common/validation/validate-request.js';
import { loginSchema } from '../dto/login.dto.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { AuthService } from '../services/auth.service.js';

const repository = new AuthRepository();
const service = new AuthService(repository);

export const authRouter = Router();

authRouter.post('/login', validateRequest(loginSchema), (req, res) => {
  res.json(service.login(req.body));
});
