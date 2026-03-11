import { z } from 'zod';

export const createClassroomSchema = z.object({
  name: z.string().min(1),
});

export type CreateClassroomDto = z.infer<typeof createClassroomSchema>;
