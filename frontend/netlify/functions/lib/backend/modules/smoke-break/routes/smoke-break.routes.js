import { Router } from 'express';
import { createSmokeBreakSchema } from '@building-app/shared';
import { authMiddleware } from '../../../core/middleware/auth.js';
import { validateBody } from '../../../core/middleware/validate.js';
import { smokeBreakController } from '../controllers/smoke-break.controller.js';
export function createSmokeBreakRoutes() {
    const router = Router();
    router.use(authMiddleware);
    router.get('/invitations', smokeBreakController.list);
    router.post('/invitations', validateBody(createSmokeBreakSchema), smokeBreakController.create);
    router.post('/invitations/:id/join', smokeBreakController.join);
    router.delete('/invitations/:id', smokeBreakController.cancel);
    return router;
}
