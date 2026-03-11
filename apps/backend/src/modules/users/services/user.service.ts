import type { ApiUser, PaginatedResult } from '@packages/types';
import { BadRequestError, NotFoundError } from '../../../common/errors/app-error.js';
import type { RequestContext } from '../../../common/auth/request-context.js';
import { applyPagination, makeId } from '../../_store.js';
import type { CreateUserDto, UpdateUserDto } from '../dto/create-user.dto.js';
import { UserRepository } from '../repositories/user.repository.js';

export class UserService {
  constructor(private readonly repository: UserRepository) {}
  list(context: RequestContext, query: { page?: number; pageSize?: number; search?: string; schoolId?: string; role?: string }): PaginatedResult<ApiUser> {
    const rows = this.repository.findAll().filter((u) => u.districtId === context.districtId)
      .filter((u) => !context.schoolId || u.schoolId === context.schoolId)
      .filter((u) => !query.schoolId || u.schoolId === query.schoolId)
      .filter((u) => !query.role || u.role === query.role)
      .filter((u) => !query.search || `${u.firstName} ${u.lastName}`.toLowerCase().includes(query.search.toLowerCase()));
    return applyPagination(rows, query);
  }
  create(context: RequestContext, dto: CreateUserDto): ApiUser {
    if (this.repository.findByEmail(context.districtId, dto.email)) throw new BadRequestError('Email already exists in district');
    const user: ApiUser = { id: makeId(), districtId: context.districtId, schoolId: dto.schoolId ?? context.schoolId, role: dto.role, email: dto.email, firstName: dto.firstName, lastName: dto.lastName, isActive: dto.isActive ?? true };
    return this.repository.create(user);
  }
  getById(context: RequestContext, id: string) { const user = this.repository.findById(id); if (!user || user.districtId !== context.districtId || (context.schoolId && user.schoolId !== context.schoolId)) throw new NotFoundError('User'); return user; }
  update(context: RequestContext, id: string, dto: UpdateUserDto) { this.getById(context, id); return this.repository.update(id, dto as Partial<ApiUser>); }
  remove(context: RequestContext, id: string) { this.getById(context, id); this.repository.delete(id); }
}
