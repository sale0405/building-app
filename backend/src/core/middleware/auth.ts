import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '@building-app/shared';
import { config } from '../../config/modules.js';
import prisma from '../database/prisma.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as AuthUser;
    const user = await prisma.user.findFirst({
      where: { id: payload.id, deletedAt: null },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    const moderation = await prisma.userModeration.findFirst({
      where: {
        userId: user.id,
        action: 'DISABLED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    if (moderation) {
      res.status(403).json({ success: false, error: 'Account disabled' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      floorId: user.floorId,
    };
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }
    next();
  };
}

export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret) as AuthUser;
    req.user = payload;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
}
