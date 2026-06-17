import { Router } from 'express';
import { createChoreSchema, updateChoreStatusSchema } from '@building-app/shared';
import { authMiddleware } from '../../../core/middleware/auth.js';
import { validateBody } from '../../../core/middleware/validate.js';
import { choresController } from '../controllers/chores.controller.js';

export function createChoresRoutes(): Router {
  const router = Router();
  router.use(authMiddleware);
  router.get('/companies', choresController.listCompanies);
  router.get('/requests', choresController.list);
  router.post('/requests', validateBody(createChoreSchema), choresController.create);
  router.get('/requests/:id', choresController.getById);
  router.post('/requests/:id/volunteer', choresController.volunteer);
  router.patch('/requests/:id/status', validateBody(updateChoreStatusSchema), choresController.updateStatus);
  return router;
}
