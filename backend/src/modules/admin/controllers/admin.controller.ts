import type { Response } from 'express';
import { AdminService, AdminRepository } from '../services/admin.service.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';

const service = new AdminService(new AdminRepository());

export const adminController = {
  listUsers: async (req: AuthenticatedRequest, res: Response) => {
    const floorId = (req.query.floorId as string) || undefined;
    const data = await service.listUsers(floorId);
    res.json({ success: true, data });
  },

  disableUser: async (req: AuthenticatedRequest, res: Response) => {
    try {
      await service.disableUser(req.params.id, req.user!.id, req.body.reason || 'Admin action');
      res.json({ success: true, message: 'User disabled' });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  removeListing: async (req: AuthenticatedRequest, res: Response) => {
    try {
      await service.removeListing(req.params.id, req.user!.id);
      res.json({ success: true, message: 'Listing removed' });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  createReport: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.createReport({
        reporterId: req.user!.id,
        ...req.body,
      });
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  listReports: async (_req: AuthenticatedRequest, res: Response) => {
    const data = await service.listReports();
    res.json({ success: true, data });
  },

  analytics: async (req: AuthenticatedRequest, res: Response) => {
    const floorId = (req.query.floorId as string) || undefined;
    const data = await service.getAnalytics(floorId);
    res.json({ success: true, data });
  },
};
