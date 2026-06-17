import type { Response } from 'express';
import {
  BuildingAnnouncementsRepository,
  BuildingAnnouncementsService,
} from '../services/building-announcements.service.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';

const service = new BuildingAnnouncementsService(new BuildingAnnouncementsRepository());

export const buildingAnnouncementsController = {
  list: async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.list();
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  create: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.create(req.user!.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  remove: async (req: AuthenticatedRequest, res: Response) => {
    try {
      await service.remove(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(404).json({ success: false, error: (err as Error).message });
    }
  },
};
