import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';

export function createAnalyticsRouter(controller: AnalyticsController): Router {
  const router = Router();

  router.get('/analytics/:scope', controller.getAnalytics);

  return router;
}
