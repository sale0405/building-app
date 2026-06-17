import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.js';

export function resolveFloorContext(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const floorId = (req.query.floorId as string) || req.body?.floorId || req.user?.floorId;

  if (!floorId) {
    res.status(400).json({ success: false, error: 'Floor context required' });
    return;
  }

  req.body = { ...req.body, _floorId: floorId };
  next();
}

export function getFloorId(req: AuthenticatedRequest): string | undefined {
  return (req.query.floorId as string) || req.body?._floorId || req.user?.floorId;
}
