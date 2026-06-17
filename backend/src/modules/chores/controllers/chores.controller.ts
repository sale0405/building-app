import type { Response } from 'express';
import { ChoresService, ChoresRepository } from '../services/chores.service.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';

const service = new ChoresService(new ChoresRepository());

export const choresController = {
  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.create(req.user!.id, req.body, req.user!.floorId);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  list: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const floorId = (req.query.floorId as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const data = await service.list(req.user!.id, floorId, status);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  listCompanies: async (_req: AuthenticatedRequest, res: Response) => {
    const data = await service.listCompanies();
    res.json({ success: true, data });
  },

  getById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.getById(req.params.id, req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(404).json({ success: false, error: (err as Error).message });
    }
  },

  volunteer: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.volunteer(req.params.id, req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  updateStatus: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.updateStatus(req.params.id, req.body.status, req.user!.id);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },
};
