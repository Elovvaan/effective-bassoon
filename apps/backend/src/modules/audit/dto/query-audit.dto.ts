import { z } from 'zod';
export const queryAuditSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), entityType: z.string().optional(), entityId: z.string().optional(), actorUserId: z.string().optional(), action: z.string().optional() });
