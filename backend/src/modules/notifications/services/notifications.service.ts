import crypto from 'crypto';
import type {
  NotificationResponseAction,
  NotificationType,
  NotificationValidityMode,
} from '@prisma/client';
import prisma from '../../../core/database/prisma.js';
import { eventBus } from '../../../core/events/event-bus.js';
import type { NotificationDto } from '@building-app/shared';
import { NotificationsRepository } from '../repositories/notifications.repository.js';

function toDto(n: {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: unknown;
  createdByUserId: string | null;
  validityMode: NotificationValidityMode;
  expiresAt: Date | null;
  resolvedAt: Date | null;
  userResponse: NotificationResponseAction | null;
  readAt: Date | null;
  createdAt: Date;
}): NotificationDto {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationDto['type'],
    title: n.title,
    body: n.body,
    metadata: (n.metadata as Record<string, unknown>) ?? {},
    createdByUserId: n.createdByUserId,
    validityMode: n.validityMode as NotificationDto['validityMode'],
    expiresAt: n.expiresAt?.toISOString() ?? null,
    resolvedAt: n.resolvedAt?.toISOString() ?? null,
    userResponse: n.userResponse as NotificationDto['userResponse'],
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

export class NotificationsService {
  constructor(private repo: NotificationsRepository) {}

  async notify(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
    createdByUserId?: string;
    validityMode?: NotificationValidityMode;
    expiresAt?: Date | null;
  }) {
    const notification = await this.repo.create(data);
    const dto = toDto(notification);
    eventBus.emit('notification.created', { notification: dto });
    return dto;
  }

  async list(userId: string, page: number, pageSize: number) {
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

  async createAnnouncement(
    creatorId: string,
    data: {
      title: string;
      body: string;
      validityMode: 'TIMED' | 'UNTIL_RESOLVED';
      expiresAt?: string;
      floorId?: string;
    },
  ) {
    const creator = await prisma.user.findFirst({
      where: { id: creatorId, deletedAt: null },
      select: { id: true, floorId: true },
    });
    if (!creator) throw new Error('User not found');

    const floorId = data.floorId ?? creator.floorId;
    if (!floorId) {
      throw new Error('Complete your profile with a floor before posting notifications');
    }

    const postId = crypto.randomUUID();
    const expiresAt =
      data.validityMode === 'TIMED' && data.expiresAt ? new Date(data.expiresAt) : null;
    const validityMode = data.validityMode as NotificationValidityMode;
    const recipients = await this.repo.findFloorUserIds(floorId);
    const allUserIds = [...new Set([creatorId, ...recipients.map((u) => u.id)])];

    const created: NotificationDto[] = [];
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

    return { postId, count: created.length, notification: created.find((n) => n.userId === creatorId)! };
  }

  markRead(id: string, userId: string) {
    return this.repo.markRead(id, userId);
  }

  markAllRead(userId: string) {
    return this.repo.markAllRead(userId);
  }

  async delete(id: string, userId: string) {
    const result = await this.repo.softDelete(id, userId);
    if (result.count === 0) throw new Error('Notification not found');
  }

  async respond(id: string, userId: string, action: NotificationResponseAction) {
    const notification = await this.repo.findByIdForUser(id, userId);
    if (!notification) throw new Error('Notification not found');
    await this.repo.respond(id, userId, action);
    const updated = await this.repo.findByIdForUser(id, userId);
    return updated ? toDto(updated) : null;
  }

  async resolve(id: string, userId: string) {
    const notification = await this.repo.findByIdForUser(id, userId);
    if (!notification) throw new Error('Notification not found');
    if (notification.createdByUserId !== userId) {
      throw new Error('Only the author can resolve this notification');
    }
    if (notification.validityMode !== 'UNTIL_RESOLVED') {
      throw new Error('This notification is not ongoing until resolved');
    }
    if (notification.resolvedAt) throw new Error('Notification already resolved');

    const postId = (notification.metadata as Record<string, unknown>)?.postId as string | undefined;
    if (postId) {
      await this.repo.resolveBroadcast(postId, userId);
    } else {
      await this.repo.resolve(id, userId);
    }

    const updated = await this.repo.findByIdForUser(id, userId);
    return updated ? toDto(updated) : null;
  }

  subscribePush(userId: string, endpoint: string, keys: object) {
    return this.repo.upsertPushSubscription(userId, endpoint, keys);
  }
}

export { toDto as toNotificationDto };
