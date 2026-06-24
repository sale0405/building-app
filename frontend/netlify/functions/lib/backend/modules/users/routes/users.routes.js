import { Router } from 'express';
import { updateProfileSchema } from '@building-app/shared';
import { authMiddleware } from '../../../core/middleware/auth.js';
import { validateBody } from '../../../core/middleware/validate.js';
import { createUsersController } from '../controllers/users.controller.js';
export function createUsersRoutes(storage) {
    const router = Router();
    const controller = createUsersController(storage);
    router.use(authMiddleware);
    router.get('/me', controller.getMe);
    router.patch('/me', validateBody(updateProfileSchema), controller.updateMe);
    router.post('/me/photo', controller.uploadPhoto);
    router.get('/', controller.list);
    router.get('/:id', controller.getById);
    return router;
}
