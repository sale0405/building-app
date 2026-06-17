import { Router } from 'express';
import { createConversationSchema, sendMessageSchema, startDirectChatSchema } from '@building-app/shared';
import { authMiddleware } from '../../../core/middleware/auth.js';
import { validateBody } from '../../../core/middleware/validate.js';
import type { StorageService } from '../../../core/storage/storage.interface.js';
import { createChatController } from '../controllers/chat.controller.js';

export function createChatRoutes(storage: StorageService): Router {
  const router = Router();
  const controller = createChatController(storage);

  router.use(authMiddleware);
  router.get('/users', controller.listChatUsers);
  router.get('/conversations', controller.listConversations);
  router.post('/conversations/direct', validateBody(startDirectChatSchema), controller.startDirectChat);
  router.post('/conversations', validateBody(createConversationSchema), controller.createConversation);
  router.get('/conversations/:id/messages', controller.getMessages);
  router.post('/conversations/:id/messages', validateBody(sendMessageSchema), controller.sendMessage);
  router.post('/conversations/:id/messages/attachment', controller.sendMessageWithAttachment);
  router.post('/conversations/:id/messages/:messageId/read', controller.markRead);

  return router;
}
