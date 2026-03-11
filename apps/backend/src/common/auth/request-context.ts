import type { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '../errors/app-error.js';
export type ApiRole = 'district_admin' | 'school_admin' | 'teacher' | 'student';
export interface RequestContext { userId: string; districtId: string; schoolId?: string; role: ApiRole; }
const roleSet = new Set<ApiRole>(['district_admin', 'school_admin', 'teacher', 'student']);
export const getRequestContext = (req: Request): RequestContext => {
  const userId = req.header('x-user-id');
  const districtId = req.header('x-district-id');
  const schoolId = req.header('x-school-id') ?? undefined;
  const roleHeader = req.header('x-role');
  if (!userId || !districtId || !roleHeader || !roleSet.has(roleHeader as ApiRole)) throw new BadRequestError('Missing or invalid request context headers');
  return { userId, districtId, schoolId, role: roleHeader as ApiRole };
};
export const requireRoles = (roles: ApiRole[]) => (req: Request, _res: Response, next: NextFunction): void => {
  const context = getRequestContext(req);
  if (!roles.includes(context.role)) throw new BadRequestError('Insufficient permissions');
  next();
};
