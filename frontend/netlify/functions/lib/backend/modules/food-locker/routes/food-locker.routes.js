import { Router } from 'express';
import { authMiddleware } from '../../../core/middleware/auth.js';
import { createFoodLockerController } from '../controllers/food-locker.controller.js';
export function createFoodLockerRoutes(storage) {
    const router = Router();
    const controller = createFoodLockerController(storage);
    router.use(authMiddleware);
    router.get('/listings', controller.list);
    router.post('/listings', controller.create);
    router.get('/listings/:id', controller.getById);
    router.post('/listings/:id/reserve', controller.reserve);
    router.post('/listings/:id/sold', controller.markSold);
    router.post('/listings/:id/rate', controller.rate);
    return router;
}
