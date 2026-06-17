import type { NotificationResponseAction, NotificationType, NotificationValidityMode } from '@prisma/client';
import prisma from '../../../core/database/prisma.js';

export class NotificationsRepository {
  create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
    createdByUserId?: string;
    validityMode?: NotificationValidityMode;
    expiresAt?: Date | null;
  }) {
    return prisma.notification.create({
      data: {
        ...data,
        metadata: data.metadata ?? {},
        validityMode: data.validityMode ?? 'PERMANENT',
      },
    });
  }

  findByUser(userId: string, page: number, pageSize: number) {
    return prisma.notification.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  findByIdForUser(id: string, userId: string) {
    return prisma.notification.findFirst({
      where: { id, userId, deletedAt: null },
    });
  }

  countByUser(userId: string) {
    return prisma.notification.count({ where: { userId, deletedAt: null } });
  }

  countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, readAt: null, deletedAt: null },
    });
  }

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, deletedAt: null },
      data: { readAt: new Date() },
    });
  }

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, readAt: null, deletedAt: null },
      data: { readAt: new Date() },
    });
  }

  softDelete(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  respond(id: string, userId: string, action: NotificationResponseAction) {
    return prisma.notification.updateMany({
      where: { id, userId, deletedAt: null },
      data: { userResponse: action, readAt: new Date() },
    });
  }

  resolve(id: string, userId: string) {
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

  resolveBroadcast(postId: string, creatorId: string) {
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

  findFloorUserIds(floorId: string, excludeUserId?: string) {
    return prisma.user.findMany({
      where: {
        floorId,
        deletedAt: null,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    });
  }

  upsertPushSubscription(userId: string, endpoint: string, keys: object) {
    return prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { userId, endpoint, keys },
      update: { userId, keys },
    });
  }

  getPushSubscriptions(userId: string) {
    return prisma.pushSubscription.findMany({ where: { userId } });
  }
}
