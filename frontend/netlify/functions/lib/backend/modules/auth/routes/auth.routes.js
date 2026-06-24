import { Router } from 'express';
import { registerSchema, loginSchema, refreshTokenSchema, forgotPasswordSchema, resetPasswordSchema, } from '@building-app/shared';
import { validateBody } from '../../../core/middleware/validate.js';
import { authController } from '../controllers/auth.controller.js';
export function createAuthRoutes() {
    const router = Router();
    router.get('/floors', (req, res) => authController.getFloors(req, res));
    router.post('/register', validateBody(registerSchema), (req, res) => authController.register(req, res));
    router.post('/login', validateBody(loginSchema), (req, res) => authController.login(req, res));
    router.post('/logout', validateBody(refreshTokenSchema), (req, res) => authController.logout(req, res));
    router.post('/refresh', validateBody(refreshTokenSchema), (req, res) => authController.refresh(req, res));
    router.post('/forgot-password', validateBody(forgotPasswordSchema), (req, res) => authController.forgotPassword(req, res));
    router.post('/reset-password', validateBody(resetPasswordSchema), (req, res) => authController.resetPassword(req, res));
    return router;
}
