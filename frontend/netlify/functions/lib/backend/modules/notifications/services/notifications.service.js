import crypto from 'crypto';
import prisma from '../../../core/database/prisma.js';
import { eventBus } from '../../../core/events/event-bus.js';
function toDto(n) {
    return {
        id: n.id,
        userId: n.userId,
        type: n.type,
        title: n.title,
        body: n.body,
        metadata: n.metadata ?? {},
        createdByUserId: n.createdByUserId,
        validityMode: n.validityMode,
        expiresAt: n.expiresAt?.toISOString() ?? null,
        resolvedAt: n.resolvedAt?.toISOString() ?? null,
        userResponse: n.userResponse,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
    };
}
export class NotificationsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async notify(data) {
        const notification = await this.repo.create(data);
        const dto = toDto(notification);
        eventBus.emit('notification.created', { notification: dto });
        return dto;
    }
    async list(userId, page, pageSize) {
        const [items, total, unread] = await Promise.all([
            this.repo.findByUser(userId, page, pageSize),
            this.repo.countByUser(userId),
            this.repo.countUnread(userId),
        ]);
        return {
            items: items.map(toDto),
            total,
            unread,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async createAnnouncement(creatorId, data) {
        const creator = await prisma.user.findFirst({
            where: { id: creatorId, deletedAt: null },
            select: { id: true, floorId: true },
        });
        if (!creator)
            throw new Error('User not found');
        const floorId = data.floorId ?? creator.floorId;
        if (!floorId) {
            throw new Error('Complete your profile with a floor before posting notifications');
        }
        const postId = crypto.randomUUID();
        const expiresAt = data.validityMode === 'TIMED' && data.expiresAt ? new Date(data.expiresAt) : null;
        const validityMode = data.validityMode;
        const recipients = await this.repo.findFloorUserIds(floorId);
        const allUserIds = [...new Set([creatorId, ...recipients.map((u) => u.id)])];
        const created = [];
        for (const userId of allUserIds) {
            const notification = await this.notify({
                userId,
                type: 'ANNOUNCEMENT',
                title: data.title,
                body: data.body,
                createdByUserId: creatorId,
                validityMode,
                expiresAt,
                metadata: {
                    postId,
                    floorId,
                    isAuthor: userId === creatorId,
                },
            });
            created.push(notification);
        }
        return { postId, count: created.length, notification: created.find((n) => n.userId === creatorId) };
    }
    markRead(id, userId) {
        return this.repo.markRead(id, userId);
    }
    markAllRead(userId) {
        return this.repo.markAllRead(userId);
    }
    async delete(id, userId) {
        const result = await this.repo.softDelete(id, userId);
        if (result.count === 0)
            throw new Error('Notification not found');
    }
    async respond(id, userId, action) {
        const notification = await this.repo.findByIdForUser(id, userId);
        if (!notification)
            throw new Error('Notification not found');
        await this.repo.respond(id, userId, action);
        const updated = await this.repo.findByIdForUser(id, userId);
        return updated ? toDto(updated) : null;
    }
    async resolve(id, userId) {
        const notification = await this.repo.findByIdForUser(id, userId);
        if (!notification)
            throw new Error('Notification not found');
        if (notification.createdByUserId !== userId) {
            throw new Error('Only the author can resolve this notification');
        }
        if (notification.validityMode !== 'UNTIL_RESOLVED') {
            throw new Error('This notification is not ongoing until resolved');
        }
        if (notification.resolvedAt)
            throw new Error('Notification already resolved');
        const postId = notification.metadata?.postId;
        if (postId) {
            await this.repo.resolveBroadcast(postId, userId);
        }
        else {
            await this.repo.resolve(id, userId);
        }
        const updated = await this.repo.findByIdForUser(id, userId);
        return updated ? toDto(updated) : null;
    }
    subscribePush(userId, endpoint, keys) {
        return this.repo.upsertPushSubscription(userId, endpoint, keys);
    }
}
export { toDto as toNotificationDto };
