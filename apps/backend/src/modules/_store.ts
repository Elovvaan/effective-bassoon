import type { ApiAssignment, ApiAuditLog, ApiClassroom, ApiRubric, ApiSchool, ApiSubmission, ApiUser, PaginatedResult, PaginationQuery } from '@packages/types';

export const store = {
  users: new Map<string, ApiUser>(),
  schools: new Map<string, ApiSchool>(),
  classes: new Map<string, ApiClassroom>(),
  assignments: new Map<string, ApiAssignment>(),
  submissions: new Map<string, ApiSubmission>(),
  rubrics: new Map<string, ApiRubric>(),
  audits: new Map<string, ApiAuditLog>(),
};

export const applyPagination = <T>(items: T[], query: PaginationQuery): PaginatedResult<T> => {
  const page = query.page && query.page > 0 ? query.page : 1;
  const pageSize = query.pageSize && query.pageSize > 0 ? query.pageSize : 25;
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
};

export const makeId = () => crypto.randomUUID();
