import { z } from 'zod';

export const createAssignmentSchema = z.object({
  name: z.string().min(1),
});

export type CreateAssignmentDto = z.infer<typeof createAssignmentSchema>;
