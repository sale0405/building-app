import { createNotificationsRoutes } from './routes/notifications.routes.js';
import { NotificationsService } from './services/notifications.service.js';
import { NotificationsRepository } from './repositories/notifications.repository.js';
import { PushService } from './services/push.service.js';
import { eventBus } from '../../core/events/event-bus.js';
const notificationsRepo = new NotificationsRepository();
const notificationsService = new NotificationsService(notificationsRepo);
const pushService = new PushService(notificationsRepo);
function setupEventListeners() {
    eventBus.on('notification.created', async ({ notification }) => {
        await pushService.sendToUser(notification.userId, notification);
    });
    eventBus.on('user.registered', async ({ userId }) => {
        await notificationsService.notify({
            userId,
            type: 'SYSTEM',
            title: 'Dobrodošli!',
            body: 'Dobrodošli u IT PARK OSIJEK. Istražite mogućnosti na svom katu.',
        });
    });
    eventBus.on('smoke-break.invitation.created', async ({ invitation, floorId }) => {
        const breakLabel = invitation.breakType === 'COFFEE' ? 'Pauza za kavu' : 'Pauza za pušenje';
        await notificationsService.notify({
            userId: invitation.creatorId,
            type: 'SMOKE_BREAK',
            title: `${breakLabel} objavljena`,
            body: `${breakLabel} na lokaciji ${invitation.location}`,
            metadata: { invitationId: invitation.id, floorId, breakType: invitation.breakType },
        });
    });
    eventBus.on('smoke-break.participant.joined', async ({ invitationId, userId, creatorId }) => {
        await notificationsService.notify({
            userId: creatorId,
            type: 'SMOKE_BREAK',
            title: 'Netko se pridružio vašoj pauzi',
            body: 'Kolega/kolegica se pridružio/la vašem pozivu za pauzu',
            metadata: { invitationId, userId },
        });
    });
    eventBus.on('chore.request.created', async ({ chore, floorId, notifyUserIds }) => {
        for (const userId of notifyUserIds) {
            await notificationsService.notify({
                userId,
                type: 'CHORE',
                title: 'Novi CO-OP zahtjev',
                body: chore.title,
                metadata: { choreId: chore.id, floorId, audienceType: chore.audienceType },
            });
        }
        await notificationsService.notify({
            userId: chore.requesterId,
            type: 'CHORE',
            title: 'CO-OP zahtjev objavljen',
            body: chore.title,
            metadata: { choreId: chore.id, floorId },
        });
    });
    eventBus.on('chore.status.changed', async ({ choreId, status, requesterId, volunteerId }) => {
        const targets = [requesterId, volunteerId].filter(Boolean);
        for (const userId of targets) {
            await notificationsService.notify({
                userId,
                type: 'CHORE',
                title: 'CO-OP status ažuriran',
                body: `Status promijenjen u ${status}`,
                metadata: { choreId, status },
            });
        }
    });
    eventBus.on('food-locker.item.reserved', async ({ listingId, buyerId, sellerId }) => {
        await notificationsService.notify({
            userId: sellerId,
            type: 'FOOD_LOCKER',
            title: 'Artikl rezerviran',
            body: 'Netko je rezervirao vaš Food Locker oglas',
            metadata: { listingId, buyerId },
        });
    });
    eventBus.on('food-locker.item.sold', async ({ listingId, buyerId, sellerId }) => {
        await notificationsService.notify({
            userId: sellerId,
            type: 'FOOD_LOCKER',
            title: 'Artikl prodan',
            body: 'Vaš Food Locker oglas označen je kao prodan',
            metadata: { listingId, buyerId },
        });
    });
    eventBus.on('building-announcement.created', async ({ announcement, userIds }) => {
        for (const userId of userIds) {
            if (userId === announcement.createdByUserId)
                continue;
            await notificationsService.notify({
                userId,
                type: 'ADMIN',
                title: 'Nova obavijest zgrade',
                body: announcement.title,
                metadata: { announcementId: announcement.id },
            });
        }
    });
    eventBus.on('chat.message.sent', async ({ message, recipientIds }) => {
        for (const userId of recipientIds) {
            if (userId === message.senderId)
                continue;
            await notificationsService.notify({
                userId,
                type: 'CHAT',
                title: 'Nova poruka',
                body: message.content.slice(0, 100),
                metadata: { conversationId: message.conversationId, messageId: message.id },
            });
        }
    });
    eventBus.on('admin.listing.removed', async ({ listingId, sellerId }) => {
        await notificationsService.notify({
            userId: sellerId,
            type: 'ADMIN',
            title: 'Oglas uklonjen',
            body: 'Administrator je uklonio vaš Food Locker oglas',
            metadata: { listingId },
        });
    });
}
export function registerModule(app, _ctx) {
    setupEventListeners();
    app.use('/api/v1/notifications', createNotificationsRoutes());
}
