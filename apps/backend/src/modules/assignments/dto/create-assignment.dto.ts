import { z } from 'zod';
export const createAssignmentSchema = z.object({ schoolId: z.string(), classroomId: z.string(), rubricId: z.string().optional(), title: z.string().min(1), description: z.string().optional(), dueAt: z.string().datetime().optional(), maxPoints: z.number().optional() });
export const updateAssignmentSchema = createAssignmentSchema.partial();
export const listAssignmentsSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), classroomId: z.string().optional(), studentId: z.string().optional() });
export type CreateAssignmentDto = z.infer<typeof createAssignmentSchema>; export type UpdateAssignmentDto = z.infer<typeof updateAssignmentSchema>;
