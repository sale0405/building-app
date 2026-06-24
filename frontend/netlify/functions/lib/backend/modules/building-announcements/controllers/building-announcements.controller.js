import { BuildingAnnouncementsRepository, BuildingAnnouncementsService, } from '../services/building-announcements.service.js';
const service = new BuildingAnnouncementsService(new BuildingAnnouncementsRepository());
export const buildingAnnouncementsController = {
    list: async (_req, res) => {
        try {
            const data = await service.list();
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    create: async (req, res) => {
        try {
            const data = await service.create(req.user.id, req.body);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    remove: async (req, res) => {
        try {
            await service.remove(req.params.id);
            res.json({ success: true });
        }
        catch (err) {
            res.status(404).json({ success: false, error: err.message });
        }
    },
};
