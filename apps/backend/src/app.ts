import express from 'express';

import { errorMiddleware } from './common/middleware/error.middleware.js';
import { allowedCorsOrigins, env } from './config/env.js';
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

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (!origin || allowedCorsOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin ?? '*');
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-district-id, x-school-id, x-role');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
    }

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }

    next();
  });

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const durationMs = Date.now() - start;
      console.log(
        JSON.stringify({
          level: 'info',
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs,
          env: env.NODE_ENV,
        }),
      );
    });
    next();
  });

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
