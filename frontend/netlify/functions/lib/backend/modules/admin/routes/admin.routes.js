import { Router } from 'express';
import { createReportSchema } from '@building-app/shared';
import { authMiddleware, requireRole } from '../../../core/middleware/auth.js';
import { validateBody } from '../../../core/middleware/validate.js';
import { adminController } from '../controllers/admin.controller.js';
export function createAdminRoutes() {
    const router = Router();
    router.use(authMiddleware, requireRole('BUILDING_ADMIN'));
    router.get('/users', adminController.listUsers);
    router.post('/users/:id/disable', adminController.disableUser);
    router.delete('/listings/:id', adminController.removeListing);
    router.get('/reports', adminController.listReports);
    router.post('/reports', validateBody(createReportSchema), adminController.createReport);
    router.get('/analytics', adminController.analytics);
    return router;
}
// Public report endpoint for all authenticated users
export function createReportRoutes() {
    const router = Router();
    router.use(authMiddleware);
    router.post('/reports', validateBody(createReportSchema), adminController.createReport);
    return router;
}
