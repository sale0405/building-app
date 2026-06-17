import { Router } from 'express';
import { createBuildingAnnouncementSchema } from '@building-app/shared';
import { authMiddleware, requireRole } from '../../../core/middleware/auth.js';
import { validateBody } from '../../../core/middleware/validate.js';
import { buildingAnnouncementsController } from '../controllers/building-announcements.controller.js';

export function createBuildingAnnouncementsRoutes(): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get('/', buildingAnnouncementsController.list);
  router.post(
    '/',
    requireRole('BUILDING_ADMIN'),
    validateBody(createBuildingAnnouncementSchema),
    buildingAnnouncementsController.create,
  );
  router.delete(
    '/:id',
    requireRole('BUILDING_ADMIN'),
    buildingAnnouncementsController.remove,
  );

  return router;
}
