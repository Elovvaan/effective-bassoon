import { z } from 'zod';
const criterionSchema = z.object({ title: z.string().min(1), description: z.string().optional(), maxScore: z.number().positive(), weight: z.number().positive(), displayOrder: z.number().int().nonnegative() });
export const createRubricSchema = z.object({ schoolId: z.string().optional(), name: z.string().min(1), description: z.string().optional(), version: z.number().int().positive().optional(), criteria: z.array(criterionSchema).min(1) });
export const updateRubricSchema = createRubricSchema.partial();
export const listRubricsSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), schoolId: z.string().optional(), name: z.string().optional() });
export type CreateRubricDto = z.infer<typeof createRubricSchema>; export type UpdateRubricDto = z.infer<typeof updateRubricSchema>;
