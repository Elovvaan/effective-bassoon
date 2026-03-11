import { z } from 'zod';

export const queryAuditSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type QueryAuditDto = z.infer<typeof queryAuditSchema>;
