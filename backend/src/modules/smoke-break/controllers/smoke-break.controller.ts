import type { Response } from 'express';
import { SmokeBreakService, SmokeBreakRepository } from '../services/smoke-break.service.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';

const service = new SmokeBreakService(new SmokeBreakRepository());

export const smokeBreakController = {
  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  list: async (req: AuthenticatedRequest, res: Response) => {
    const floorId = (req.query.floorId as string) || req.user!.floorId || undefined;
    const data = await service.listActive(floorId);
    res.json({ success: true, data });
  },

  join: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.join(req.params.id, req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  cancel: async (req: AuthenticatedRequest, res: Response) => {
    await service.cancel(req.params.id, req.user!.id);
    res.json({ success: true });
  },
};
