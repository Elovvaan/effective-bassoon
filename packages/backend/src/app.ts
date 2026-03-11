import express, { type Request, type Response } from 'express';
import { canAccessAnalytics, type Role } from './auth';
import { AssignmentService } from './assignments';
import { summarizeAssignments } from './analytics';

const parseRole = (value: string | undefined): Role => {
  if (value === 'admin' || value === 'instructor' || value === 'student') {
    return value;
  }

  return 'student';
};

export const createApp = () => {
  const app = express();
  app.use(express.json());

  const assignmentService = new AssignmentService();

  app.get('/auth/check', (req: Request, res: Response) => {
    const role = parseRole(req.header('x-role'));
    res.json({ role, canViewAnalytics: canAccessAnalytics(role) });
  });

  app.post('/assignments', (req: Request, res: Response) => {
    const { id, title, assigneeId } = req.body;

    if (!id || !title || !assigneeId) {
      return res.status(400).json({ error: 'id, title, and assigneeId are required' });
    }

    const assignment = assignmentService.assign(id, title, assigneeId);
    return res.status(201).json(assignment);
  });

  app.get('/assignments/:assigneeId', (req: Request, res: Response) => {
    const assignments = assignmentService.listByAssignee(req.params.assigneeId);
    res.json(assignments);
  });

  app.get('/analytics/assignments', (req: Request, res: Response) => {
    const role = parseRole(req.header('x-role'));
    if (!canAccessAnalytics(role)) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const analytics = summarizeAssignments(assignmentService.all());
    return res.json(analytics);
  });

  return app;
};
