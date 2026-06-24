import { createChatRoutes } from './routes/chat.routes.js';
import { ChatService, ChatRepository } from './services/chat.service.js';
import { eventBus } from '../../core/events/event-bus.js';
export function registerModule(app, ctx) {
    app.use('/api/v1/chat', createChatRoutes(ctx.storage));
    const chatService = new ChatService(new ChatRepository(), (key) => ctx.storage.getUrl(key));
    eventBus.on('chore.status.changed', async ({ choreId, status, requesterId, volunteerId }) => {
        if (!volunteerId)
            return;
        const conv = await new ChatRepository().createConversation({
            type: 'GROUP',
            participantIds: [requesterId, volunteerId],
            contextType: 'chore',
            contextId: choreId,
        });
        await chatService.sendSystemMessage(conv.id, `Chore status updated to ${status}`);
    });
}
