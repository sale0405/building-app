import { Router } from 'express';
import {
  createNotificationSchema,
  notificationResponseSchema,
  paginationSchema,
  pushSubscriptionSchema,
} from '@building-app/shared';
import { authMiddleware } from '../../../core/middleware/auth.js';
import { validateBody, validateQuery } from '../../../core/middleware/validate.js';
import { notificationsController } from '../controllers/notifications.controller.js';

export function createNotificationsRoutes(): Router {
  const router = Router();
  router.use(authMiddleware);
  router.get('/', validateQuery(paginationSchema), notificationsController.list);
  router.post('/', validateBody(createNotificationSchema), notificationsController.create);
  router.patch('/read-all', notificationsController.markAllRead);
  router.patch('/:id/read', notificationsController.markRead);
  router.post('/:id/respond', validateBody(notificationResponseSchema), notificationsController.respond);
  router.post('/:id/resolve', notificationsController.resolve);
  router.delete('/:id', notificationsController.delete);
  router.post('/push/subscribe', validateBody(pushSubscriptionSchema), notificationsController.subscribePush);
  return router;
}
