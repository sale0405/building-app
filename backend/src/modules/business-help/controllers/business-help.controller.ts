import type { Response } from 'express';
import { z } from 'zod';
import { BusinessHelpService, BusinessHelpRepository } from '../services/business-help.service.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';

const service = new BusinessHelpService(new BusinessHelpRepository());

const meetingSchema = z.object({
  scheduledAt: z.string().datetime(),
  location: z.string().min(1),
  notes: z.string().optional(),
});

const matchSchema = z.object({
  requestId: z.string().cuid(),
  offerId: z.string().cuid(),
});

export const businessHelpController = {
  createRequest: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.createRequest(req.user!.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  createOffer: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.createOffer(req.user!.id, req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  listRequests: async (req: AuthenticatedRequest, res: Response) => {
    const floorId = (req.query.floorId as string) || undefined;
    const data = await service.listRequests(floorId);
    res.json({ success: true, data });
  },

  listOffers: async (_req: AuthenticatedRequest, res: Response) => {
    const data = await service.listOffers();
    res.json({ success: true, data });
  },

  match: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = matchSchema.parse(req.body);
      const data = await service.match(body.requestId, body.offerId);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  scheduleMeeting: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = meetingSchema.parse(req.body);
      const data = await service.scheduleMeeting(req.params.matchId, body.scheduledAt, body.location, body.notes);
      res.status(201).json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },

  updateStatus: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = await service.updateStatus(req.params.id, req.body.status);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: (err as Error).message });
    }
  },
};
