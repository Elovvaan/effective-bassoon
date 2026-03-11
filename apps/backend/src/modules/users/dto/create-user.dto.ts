import { z } from 'zod';

export const createUserSchema = z.object({
  schoolId: z.string().optional(),
  role: z.enum(['district_admin', 'school_admin', 'teacher', 'student']),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  isActive: z.boolean().optional(),
});
export const updateUserSchema = createUserSchema.partial();
export const listUsersSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), search: z.string().optional(), schoolId: z.string().optional(), role: z.string().optional() });
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
