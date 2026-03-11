import { z } from 'zod';

export const createRubricSchema = z.object({
  name: z.string().min(1),
});

export type CreateRubricDto = z.infer<typeof createRubricSchema>;
