import { Router } from 'express';
import { createBusinessHelpRequestSchema, createBusinessHelpOfferSchema } from '@building-app/shared';
import { authMiddleware } from '../../../core/middleware/auth.js';
import { validateBody } from '../../../core/middleware/validate.js';
import { businessHelpController } from '../controllers/business-help.controller.js';

export function createBusinessHelpRoutes(): Router {
  const router = Router();
  router.use(authMiddleware);
  router.get('/requests', businessHelpController.listRequests);
  router.post('/requests', validateBody(createBusinessHelpRequestSchema), businessHelpController.createRequest);
  router.patch('/requests/:id/status', businessHelpController.updateStatus);
  router.get('/offers', businessHelpController.listOffers);
  router.post('/offers', validateBody(createBusinessHelpOfferSchema), businessHelpController.createOffer);
  router.post('/matches', businessHelpController.match);
  router.post('/matches/:matchId/meetings', businessHelpController.scheduleMeeting);
  return router;
}
