import { z } from 'zod';
export const createSubmissionSchema = z.object({ schoolId: z.string(), classroomId: z.string(), assignmentId: z.string(), studentId: z.string(), status: z.enum(['DRAFT','SUBMITTED','RETURNED','GRADED']).optional(), submittedAt: z.string().datetime().optional(), gradedAt: z.string().datetime().optional() });
export const updateSubmissionSchema = createSubmissionSchema.partial();
export const listSubmissionsSchema = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional(), assignmentId: z.string().optional(), studentId: z.string().optional(), status: z.enum(['DRAFT','SUBMITTED','RETURNED','GRADED']).optional() });
export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>; export type UpdateSubmissionDto = z.infer<typeof updateSubmissionSchema>;
