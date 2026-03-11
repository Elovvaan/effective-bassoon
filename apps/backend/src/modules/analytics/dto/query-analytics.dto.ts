import { z } from 'zod';

export const queryAnalyticsSchema = z.object({
  range: z.enum(['7d', '30d', '90d']).default('30d'),
});

export type QueryAnalyticsDto = z.infer<typeof queryAnalyticsSchema>;
