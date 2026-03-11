import { z } from 'zod';
export const createSchoolSchema = z.object({ name: z.string().min(1), code: z.string().min(1), timezone: z.string().optional() });
export const updateSchoolSchema = createSchoolSchema.partial();
export const listSchoolsSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), search: z.string().optional() });
export type CreateSchoolDto = z.infer<typeof createSchoolSchema>; export type UpdateSchoolDto = z.infer<typeof updateSchoolSchema>;
