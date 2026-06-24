import multer from 'multer';
import { z } from 'zod';
import { FoodLockerService, FoodLockerRepository } from '../services/food-locker.service.js';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const rateSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(500).optional(),
});
export function createFoodLockerController(storage) {
    const service = new FoodLockerService(new FoodLockerRepository(), (key) => storage.getUrl(key));
    return {
        create: [
            upload.array('photos', 5),
            async (req, res) => {
                try {
                    const photos = [];
                    if (req.files && Array.isArray(req.files)) {
                        for (let i = 0; i < req.files.length; i++) {
                            const file = req.files[i];
                            const key = await storage.save(file.buffer, file.originalname, file.mimetype);
                            photos.push({ storageKey: key, sortOrder: i });
                        }
                    }
                    const data = await service.create(req.user.id, {
                        floorId: req.body.floorId || req.user.floorId,
                        lockerNumber: req.body.lockerNumber,
                        title: req.body.title,
                        quantity: parseInt(req.body.quantity),
                        expirationDate: req.body.expirationDate,
                        price: parseFloat(req.body.price),
                        photos,
                    });
                    res.status(201).json({ success: true, data });
                }
                catch (err) {
                    res.status(400).json({ success: false, error: err.message });
                }
            },
        ],
        list: async (req, res) => {
            const floorId = req.query.floorId || undefined;
            const status = req.query.status || undefined;
            const data = await service.list(floorId, status);
            res.json({ success: true, data });
        },
        getById: async (req, res) => {
            try {
                const data = await service.getById(req.params.id);
                res.json({ success: true, data });
            }
            catch (err) {
                res.status(404).json({ success: false, error: err.message });
            }
        },
        reserve: async (req, res) => {
            try {
                const data = await service.reserve(req.params.id, req.user.id);
                res.json({ success: true, data });
            }
            catch (err) {
                res.status(400).json({ success: false, error: err.message });
            }
        },
        markSold: async (req, res) => {
            try {
                const data = await service.markSold(req.params.id, req.user.id);
                res.json({ success: true, data });
            }
            catch (err) {
                res.status(400).json({ success: false, error: err.message });
            }
        },
        rate: async (req, res) => {
            try {
                const body = rateSchema.parse(req.body);
                await service.rate(req.params.id, req.user.id, body.rating, body.comment);
                res.json({ success: true, message: 'Rating submitted' });
            }
            catch (err) {
                res.status(400).json({ success: false, error: err.message });
            }
        },
    };
}
