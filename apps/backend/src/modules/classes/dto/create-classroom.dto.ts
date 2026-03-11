import { z } from 'zod';
export const createClassroomSchema = z.object({ schoolId: z.string(), teacherId: z.string(), name: z.string().min(1), courseCode: z.string().min(1), academicYear: z.string().min(1), term: z.string().optional(), period: z.string().optional() });
export const updateClassroomSchema = createClassroomSchema.partial();
export const listClassroomsSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), schoolId: z.string().optional(), teacherId: z.string().optional() });
export type CreateClassroomDto = z.infer<typeof createClassroomSchema>; export type UpdateClassroomDto = z.infer<typeof updateClassroomSchema>;
