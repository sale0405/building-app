import type { NotificationDto } from '@building-app/shared';
import { NotificationType } from '@building-app/shared';
import { t } from '../../../core/i18n/index.js';

export function formatCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return t('common.expired');

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function getNotificationPath(notification: NotificationDto): string | null {
  const meta = notification.metadata;
  switch (notification.type) {
    case NotificationType.SMOKE_BREAK:
      return '/smoke-break';
    case NotificationType.CHORE:
      return '/chores';
    case NotificationType.FOOD_LOCKER:
      return '/food-locker';
    case NotificationType.ADMIN:
      return meta.announcementId ? '/building-announcements' : null;
    case NotificationType.CHAT:
      return meta.conversationId ? `/chat?conversation=${meta.conversationId}` : '/chat';
    default:
      return null;
  }
}

export interface ResponseButton {
  action: 'ACKNOWLEDGE' | 'INTERESTED' | 'DECLINE' | 'VIEW';
  label: string;
}

export function getResponseButtons(notification: NotificationDto): ResponseButton[] {
  if (notification.resolvedAt) return [];

  const path = getNotificationPath(notification);
  const buttons: ResponseButton[] = [];

  if (path) {
    buttons.push({ action: 'VIEW', label: t('notifications.view') });
  }

  switch (notification.type) {
    case NotificationType.SMOKE_BREAK:
      buttons.push({ action: 'INTERESTED', label: t('notifications.join') });
      break;
    case NotificationType.CHORE:
      buttons.push({ action: 'INTERESTED', label: t('notifications.volunteer') });
      break;
    case NotificationType.FOOD_LOCKER:
      buttons.push({ action: 'VIEW', label: t('notifications.viewListing') });
      break;
    case NotificationType.ANNOUNCEMENT:
    case NotificationType.SYSTEM:
    case NotificationType.ADMIN:
    case NotificationType.CHAT:
      buttons.push(
        { action: 'ACKNOWLEDGE', label: t('notifications.acknowledge') },
        { action: 'INTERESTED', label: t('notifications.interested') },
        { action: 'DECLINE', label: t('notifications.decline') },
      );
      break;
    default:
      buttons.push({ action: 'ACKNOWLEDGE', label: t('notifications.acknowledge') });
  }

  const unique = new Map<string, ResponseButton>();
  for (const button of buttons) {
    unique.set(`${button.action}:${button.label}`, button);
  }
  return [...unique.values()];
}

export function canResolveNotification(notification: NotificationDto, userId: string): boolean {
  return (
    notification.validityMode === 'UNTIL_RESOLVED' &&
    !notification.resolvedAt &&
    notification.createdByUserId === userId
  );
}

export function isNotificationActive(notification: NotificationDto): boolean {
  if (notification.resolvedAt) return false;
  if (notification.validityMode === 'TIMED' && notification.expiresAt) {
    return new Date(notification.expiresAt).getTime() > Date.now();
  }
  return true;
}
