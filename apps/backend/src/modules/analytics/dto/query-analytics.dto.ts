import { z } from 'zod';
export const queryAnalyticsSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), schoolId: z.string().optional(), classroomId: z.string().optional() });
