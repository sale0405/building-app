import type { Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { eventBus } from '../../../core/events/event-bus.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';
import { toUserProfileDto } from '../../users/dto/user.dto.js';

const authService = new AuthService(new AuthRepository());

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response) {
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
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  async login(req: AuthenticatedRequest, res: Response) {
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
    } catch (err) {
      res.status(401).json({ success: false, error: (err as Error).message });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      await authService.logout(req.body.refreshToken);
      res.json({ success: true, message: 'Logged out' });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  async refresh(req: AuthenticatedRequest, res: Response) {
    try {
      const tokens = await authService.refresh(req.body.refreshToken);
      res.json({ success: true, data: { tokens } });
    } catch (err) {
      res.status(401).json({ success: false, error: (err as Error).message });
    }
  }

  async forgotPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const token = await authService.forgotPassword(req.body.email);
      res.json({
        success: true,
        message: 'If the email exists, a reset link was sent',
        ...(process.env.NODE_ENV === 'development' && token ? { resetToken: token } : {}),
      });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response) {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  }

  async getFloors(_req: AuthenticatedRequest, res: Response) {
    const floors = await import('../../../core/database/prisma.js').then((m) =>
      m.default.floor.findMany({ include: { building: true }, orderBy: { number: 'asc' } }),
    );
    res.json({ success: true, data: floors });
  }
}

export const authController = new AuthController();
