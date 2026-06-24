import multer from 'multer';
import { ChatService, ChatRepository } from '../services/chat.service.js';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
export function createChatController(storage) {
    const service = new ChatService(new ChatRepository(), (key) => storage.getUrl(key));
    return {
        listChatUsers: async (req, res) => {
            const data = await service.listChatUsers(req.user.id);
            res.json({ success: true, data });
        },
        listConversations: async (req, res) => {
            const data = await service.listConversations(req.user.id);
            res.json({ success: true, data });
        },
        startDirectChat: async (req, res) => {
            try {
                const data = await service.startDirectChat(req.user.id, req.body.userId);
                res.status(201).json({ success: true, data });
            }
            catch (err) {
                res.status(400).json({ success: false, error: err.message });
            }
        },
        createConversation: async (req, res) => {
            try {
                const data = await service.createConversation(req.user.id, req.body);
                res.status(201).json({ success: true, data });
            }
            catch (err) {
                res.status(400).json({ success: false, error: err.message });
            }
        },
        getMessages: async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 50;
                const data = await service.getMessages(req.params.id, req.user.id, page, pageSize);
                res.json({ success: true, data });
            }
            catch (err) {
                res.status(404).json({ success: false, error: err.message });
            }
        },
        sendMessage: async (req, res) => {
            try {
                const data = await service.sendMessage(req.user.id, req.params.id, req.body.content, req.body.type);
                res.status(201).json({ success: true, data });
            }
            catch (err) {
                res.status(400).json({ success: false, error: err.message });
            }
        },
        sendMessageWithAttachment: [
            upload.single('file'),
            async (req, res) => {
                try {
                    if (!req.file)
                        return res.status(400).json({ success: false, error: 'No file' });
                    const key = await storage.save(req.file.buffer, req.file.originalname, req.file.mimetype);
                    const data = await service.sendMessage(req.user.id, req.params.id, req.body.content || req.file.originalname, 'FILE', [{ storageKey: key, mimeType: req.file.mimetype, fileName: req.file.originalname }]);
                    res.status(201).json({ success: true, data });
                }
                catch (err) {
                    res.status(400).json({ success: false, error: err.message });
                }
            },
        ],
        markRead: async (req, res) => {
            await service.markRead(req.params.id, req.params.messageId, req.user.id);
            res.json({ success: true });
        },
    };
}
