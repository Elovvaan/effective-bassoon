import { Router } from 'express';

import { queryAnalyticsSchema } from '../dto/query-analytics.dto.js';
import { AnalyticsRepository } from '../repositories/analytics.repository.js';
import { AnalyticsService } from '../services/analytics.service.js';

const repository = new AnalyticsRepository();
const service = new AnalyticsService(repository);

export const analyticsRouter = Router();

analyticsRouter.get('/overview', (req, res) => {
  const dto = queryAnalyticsSchema.parse(req.query);
  res.json(service.overview(dto));
});
