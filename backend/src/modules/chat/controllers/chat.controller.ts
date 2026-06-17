import type { Response } from 'express';
import multer from 'multer';
import { ChatService, ChatRepository } from '../services/chat.service.js';
import type { AuthenticatedRequest } from '../../../core/middleware/auth.js';
import type { StorageService } from '../../../core/storage/storage.interface.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export function createChatController(storage: StorageService) {
  const service = new ChatService(new ChatRepository(), (key) => storage.getUrl(key));

  return {
    listChatUsers: async (req: AuthenticatedRequest, res: Response) => {
      const data = await service.listChatUsers(req.user!.id);
      res.json({ success: true, data });
    },

    listConversations: async (req: AuthenticatedRequest, res: Response) => {
      const data = await service.listConversations(req.user!.id);
      res.json({ success: true, data });
    },

    startDirectChat: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const data = await service.startDirectChat(req.user!.id, req.body.userId);
        res.status(201).json({ success: true, data });
      } catch (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
      }
    },

    createConversation: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const data = await service.createConversation(req.user!.id, req.body);
        res.status(201).json({ success: true, data });
      } catch (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
      }
    },

    getMessages: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 50;
        const data = await service.getMessages(req.params.id, req.user!.id, page, pageSize);
        res.json({ success: true, data });
      } catch (err) {
        res.status(404).json({ success: false, error: (err as Error).message });
      }
    },

    sendMessage: async (req: AuthenticatedRequest, res: Response) => {
      try {
        const data = await service.sendMessage(req.user!.id, req.params.id, req.body.content, req.body.type);
        res.status(201).json({ success: true, data });
      } catch (err) {
        res.status(400).json({ success: false, error: (err as Error).message });
      }
    },

    sendMessageWithAttachment: [
      upload.single('file'),
      async (req: AuthenticatedRequest, res: Response) => {
        try {
          if (!req.file) return res.status(400).json({ success: false, error: 'No file' });
          const key = await storage.save(req.file.buffer, req.file.originalname, req.file.mimetype);
          const data = await service.sendMessage(
            req.user!.id,
            req.params.id,
            req.body.content || req.file.originalname,
            'FILE',
            [{ storageKey: key, mimeType: req.file.mimetype, fileName: req.file.originalname }],
          );
          res.status(201).json({ success: true, data });
        } catch (err) {
          res.status(400).json({ success: false, error: (err as Error).message });
        }
      },
    ],

    markRead: async (req: AuthenticatedRequest, res: Response) => {
      await service.markRead(req.params.id, req.params.messageId, req.user!.id);
      res.json({ success: true });
    },
  };
}
