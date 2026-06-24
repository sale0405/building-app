import { AdminService, AdminRepository } from '../services/admin.service.js';
const service = new AdminService(new AdminRepository());
export const adminController = {
    listUsers: async (req, res) => {
        const floorId = req.query.floorId || undefined;
        const data = await service.listUsers(floorId);
        res.json({ success: true, data });
    },
    disableUser: async (req, res) => {
        try {
            await service.disableUser(req.params.id, req.user.id, req.body.reason || 'Admin action');
            res.json({ success: true, message: 'User disabled' });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    removeListing: async (req, res) => {
        try {
            await service.removeListing(req.params.id, req.user.id);
            res.json({ success: true, message: 'Listing removed' });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    createReport: async (req, res) => {
        try {
            const data = await service.createReport({
                reporterId: req.user.id,
                ...req.body,
            });
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    },
    listReports: async (_req, res) => {
        const data = await service.listReports();
        res.json({ success: true, data });
    },
    analytics: async (req, res) => {
        const floorId = req.query.floorId || undefined;
        const data = await service.getAnalytics(floorId);
        res.json({ success: true, data });
    },
};
