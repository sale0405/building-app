import { NotificationsService } from '../services/notifications.service.js';
import { NotificationsRepository } from '../repositories/notifications.repository.js';
const service = new NotificationsService(new NotificationsRepository());
export class NotificationsController {
    list = async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 50;
        const data = await service.list(req.user.id, page, pageSize);
        res.json({ success: true, data });
    };
    create = async (req, res) => {
        try {
            const data = await service.createAnnouncement(req.user.id, req.body);
            res.status(201).json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    };
    markRead = async (req, res) => {
        await service.markRead(req.params.id, req.user.id);
        res.json({ success: true });
    };
    markAllRead = async (req, res) => {
        await service.markAllRead(req.user.id);
        res.json({ success: true });
    };
    delete = async (req, res) => {
        try {
            await service.delete(req.params.id, req.user.id);
            res.json({ success: true });
        }
        catch (err) {
            res.status(404).json({ success: false, error: err.message });
        }
    };
    respond = async (req, res) => {
        try {
            const data = await service.respond(req.params.id, req.user.id, req.body.action);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    };
    resolve = async (req, res) => {
        try {
            const data = await service.resolve(req.params.id, req.user.id);
            res.json({ success: true, data });
        }
        catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    };
    subscribePush = async (req, res) => {
        await service.subscribePush(req.user.id, req.body.endpoint, req.body.keys);
        res.json({ success: true, message: 'Push subscription saved' });
    };
}
export const notificationsController = new NotificationsController();
