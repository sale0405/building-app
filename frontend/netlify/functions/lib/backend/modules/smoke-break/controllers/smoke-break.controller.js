import { SmokeBreakService, SmokeBreakRepository } from '../services/smoke-break.service.js';
const service = new SmokeBreakService(new SmokeBreakRepository());
export const smokeBreakController = {
    create: async (req, res) => {
        try {
            const data = await service.create(req.user.id, req.body);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    list: async (req, res) => {
        const floorId = req.query.floorId || req.user.floorId || undefined;
        const data = await service.listActive(floorId);
        res.json({ success: true, data });
    },
    join: async (req, res) => {
        try {
            const data = await service.join(req.params.id, req.user.id);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    cancel: async (req, res) => {
        await service.cancel(req.params.id, req.user.id);
        res.json({ success: true });
    },
};
