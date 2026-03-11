import { z } from 'zod';

export const createSubmissionSchema = z.object({
  name: z.string().min(1),
});

export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;
