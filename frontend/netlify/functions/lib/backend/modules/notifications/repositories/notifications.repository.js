import prisma from '../../../core/database/prisma.js';
export class NotificationsRepository {
    create(data) {
        return prisma.notification.create({
            data: {
                ...data,
                metadata: data.metadata ?? {},
                validityMode: data.validityMode ?? 'PERMANENT',
            },
        });
    }
    findByUser(userId, page, pageSize) {
        return prisma.notification.findMany({
            where: { userId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
    }
    findByIdForUser(id, userId) {
        return prisma.notification.findFirst({
            where: { id, userId, deletedAt: null },
        });
    }
    countByUser(userId) {
        return prisma.notification.count({ where: { userId, deletedAt: null } });
    }
    countUnread(userId) {
        return prisma.notification.count({
            where: { userId, readAt: null, deletedAt: null },
        });
    }
    markRead(id, userId) {
        return prisma.notification.updateMany({
            where: { id, userId, deletedAt: null },
            data: { readAt: new Date() },
        });
    }
    markAllRead(userId) {
        return prisma.notification.updateMany({
            where: { userId, readAt: null, deletedAt: null },
            data: { readAt: new Date() },
        });
    }
    softDelete(id, userId) {
        return prisma.notification.updateMany({
            where: { id, userId, deletedAt: null },
            data: { deletedAt: new Date() },
        });
    }
    respond(id, userId, action) {
        return prisma.notification.updateMany({
            where: { id, userId, deletedAt: null },
            data: { userResponse: action, readAt: new Date() },
        });
    }
    resolve(id, userId) {
        return prisma.notification.updateMany({
            where: {
                id,
                deletedAt: null,
                createdByUserId: userId,
                validityMode: 'UNTIL_RESOLVED',
                resolvedAt: null,
            },
            data: { resolvedAt: new Date() },
        });
    }
    resolveBroadcast(postId, creatorId) {
        return prisma.notification.updateMany({
            where: {
                deletedAt: null,
                createdByUserId: creatorId,
                validityMode: 'UNTIL_RESOLVED',
                resolvedAt: null,
                metadata: { path: ['postId'], equals: postId },
            },
            data: { resolvedAt: new Date() },
        });
    }
    findFloorUserIds(floorId, excludeUserId) {
        return prisma.user.findMany({
            where: {
                floorId,
                deletedAt: null,
                ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
            },
            select: { id: true },
        });
    }
    upsertPushSubscription(userId, endpoint, keys) {
        return prisma.pushSubscription.upsert({
            where: { endpoint },
            create: { userId, endpoint, keys },
            update: { userId, keys },
        });
    }
    getPushSubscriptions(userId) {
        return prisma.pushSubscription.findMany({ where: { userId } });
    }
}
