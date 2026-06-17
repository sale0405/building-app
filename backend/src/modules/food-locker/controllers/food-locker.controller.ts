import type { Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { FoodLockerService, FoodLockerRepository } from '../services/food-locker.service.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';
import type { StorageService } from '../../../core/storage/storage.interface.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const rateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export function createFoodLockerController(storage: StorageService) {
  const service = new FoodLockerService(new FoodLockerRepository(), (key) => storage.getUrl(key));

  return {
    create: [
      upload.array('photos', 5),
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          const photos: { storageKey: string; sortOrder: number }[] = [];
          if (req.files && Array.isArray(req.files)) {
            for (let i = 0; i < req.files.length; i++) {
              const file = req.files[i];
              const key = await storage.save(file.buffer, file.originalname, file.mimetype);
              photos.push({ storageKey: key, sortOrder: i });
            }
          }
          const data = await service.create(req.user!.id, {
            floorId: req.body.floorId || req.user!.floorId,
            lockerNumber: req.body.lockerNumber,
            title: req.body.title,
            quantity: parseInt(req.body.quantity),
            expirationDate: req.body.expirationDate,
            price: parseFloat(req.body.price),
            photos,
          });
          res.status(201).json({ success: true, data });
        } catch (err) {
          res.status(400).json({ success: false, error: (err as Error).message });
        }
      },
    ],

    list: async (req: AuthenticatedRequest, res: Response) => {
      const floorId = (req.query.floorId as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const data = await service.list(floorId, status);
      res.json({ success: true, data });
    },

    getById: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const data = await service.getById(req.params.id);
        res.json({ success: true, data });
      } catch (err) {
        res.status(404).json({ success: false, error: (err as Error).message });
      }
    },

    reserve: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const data = await service.reserve(req.params.id, req.user!.id);
        res.json({ success: true, data });
      } catch (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
      }
    },

    markSold: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const data = await service.markSold(req.params.id, req.user!.id);
        res.json({ success: true, data });
      } catch (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
      }
    },

    rate: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const body = rateSchema.parse(req.body);
        await service.rate(req.params.id, req.user!.id, body.rating, body.comment);
        res.json({ success: true, message: 'Rating submitted' });
      } catch (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
      }
    },
  };
}
