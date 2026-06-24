import { ChoresService, ChoresRepository } from '../services/chores.service.js';
const service = new ChoresService(new ChoresRepository());
export const choresController = {
    create: async (req, res) => {
        try {
            const data = await service.create(req.user.id, req.body, req.user.floorId);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    list: async (req, res) => {
        try {
            const floorId = req.query.floorId || undefined;
            const status = req.query.status || undefined;
            const data = await service.list(req.user.id, floorId, status);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    listCompanies: async (_req, res) => {
        const data = await service.listCompanies();
        res.json({ success: true, data });
    },
    getById: async (req, res) => {
        try {
            const data = await service.getById(req.params.id, req.user.id);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(404).json({ success: false, error: err.message });
        }
    },
    volunteer: async (req, res) => {
        try {
            const data = await service.volunteer(req.params.id, req.user.id);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    updateStatus: async (req, res) => {
        try {
            const data = await service.updateStatus(req.params.id, req.body.status, req.user.id);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
};
