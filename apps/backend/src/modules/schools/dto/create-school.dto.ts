import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(1),
});

export type CreateSchoolDto = z.infer<typeof createSchoolSchema>;
