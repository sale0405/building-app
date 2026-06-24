import { AuthService } from '../services/auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { eventBus } from '../../../core/events/event-bus.js';
import { toUserProfileDto } from '../../users/dto/user.dto.js';
const authService = new AuthService(new AuthRepository());
export class AuthController {
    async register(req, res) {
        try {
            const { user, tokens } = await authService.register(req.body);
            const fullUser = await new AuthRepository().findByEmail(user.email);
            eventBus.emit('user.registered', {
                userId: user.id,
                email: user.email,
                role: user.role,
                floorId: user.floorId,
            });
            res.status(201).json({
                success: true,
                data: {
                    user: fullUser ? toUserProfileDto(fullUser) : toUserProfileDto(user),
                    tokens,
                },
            });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
    async login(req, res) {
        try {
            const { user, tokens } = await authService.login(req.body.email, req.body.password);
            const fullUser = await new AuthRepository().findByEmail(user.email);
            res.json({
                success: true,
                data: {
                    user: fullUser ? toUserProfileDto(fullUser) : null,
                    tokens,
                },
            });
        }
        catch (err) {
            res.status(401).json({ success: false, error: err.message });
        }
    }
    async logout(req, res) {
        try {
            await authService.logout(req.body.refreshToken);
            res.json({ success: true, message: 'Logged out' });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
    async refresh(req, res) {
        try {
            const tokens = await authService.refresh(req.body.refreshToken);
            res.json({ success: true, data: { tokens } });
        }
        catch (err) {
            res.status(401).json({ success: false, error: err.message });
        }
    }
    async forgotPassword(req, res) {
        try {
            const token = await authService.forgotPassword(req.body.email);
            res.json({
                success: true,
                message: 'If the email exists, a reset link was sent',
                ...(process.env.NODE_ENV === 'development' && token ? { resetToken: token } : {}),
            });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
    async resetPassword(req, res) {
        try {
            await authService.resetPassword(req.body.token, req.body.password);
            res.json({ success: true, message: 'Password reset successful' });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
    async getFloors(_req, res) {
        const floors = await import('../../../core/database/prisma.js').then((m) => m.default.floor.findMany({ include: { building: true }, orderBy: { number: 'asc' } }));
        res.json({ success: true, data: floors });
    }
}
export const authController = new AuthController();
