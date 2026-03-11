import { Router } from 'express'; import { asyncHandler } from '../../../common/http/async-handler.js'; import { validateRequest } from '../../../common/validation/validate-request.js'; import { loginSchema } from '../dto/login.dto.js'; import { AuthRepository } from '../repositories/auth.repository.js'; import { AuthService } from '../services/auth.service.js';
const service = new AuthService(new AuthRepository()); export const authRouter = Router();
authRouter.post('/login', validateRequest(loginSchema), asyncHandler(async (req,res)=>res.json(service.login(req.body))));
