import express from 'express';

import { errorMiddleware } from './common/middleware/error.middleware.js';
import { env } from './config/env.js';
import { analyticsRouter } from './modules/analytics/controllers/analytics.controller.js';
import { assignmentsRouter } from './modules/assignments/controllers/assignments.controller.js';
import { auditRouter } from './modules/audit/controllers/audit.controller.js';
import { authRouter } from './modules/auth/controllers/auth.controller.js';
import { classesRouter } from './modules/classes/controllers/classes.controller.js';
import { rubricsRouter } from './modules/rubrics/controllers/rubrics.controller.js';
import { schoolsRouter } from './modules/schools/controllers/schools.controller.js';
import { submissionsRouter } from './modules/submissions/controllers/submissions.controller.js';
import { usersRouter } from './modules/users/controllers/users.controller.js';

export const buildApp = () => {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV });
  });

  app.use(`${env.API_PREFIX}/auth`, authRouter);
  app.use(`${env.API_PREFIX}/users`, usersRouter);
  app.use(`${env.API_PREFIX}/schools`, schoolsRouter);
  app.use(`${env.API_PREFIX}/classes`, classesRouter);
  app.use(`${env.API_PREFIX}/assignments`, assignmentsRouter);
  app.use(`${env.API_PREFIX}/submissions`, submissionsRouter);
  app.use(`${env.API_PREFIX}/rubrics`, rubricsRouter);
  app.use(`${env.API_PREFIX}/analytics`, analyticsRouter);
  app.use(`${env.API_PREFIX}/audit`, auditRouter);

  app.use(errorMiddleware);

  return app;
};
