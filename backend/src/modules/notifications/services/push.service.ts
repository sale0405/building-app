import webpush from 'web-push';
import { config } from '../../../config/modules.js';
import type { NotificationDto } from '@building-app/shared';
import { NotificationsRepository } from '../repositories/notifications.repository.js';

export class PushService {
  private enabled = false;

  constructor(private repo: NotificationsRepository) {
    if (config.vapid.publicKey && config.vapid.privateKey) {
      webpush.setVapidDetails(config.vapid.subject, config.vapid.publicKey, config.vapid.privateKey);
      this.enabled = true;
    }
  }

  async sendToUser(userId: string, notification: NotificationDto) {
    if (!this.enabled) return;
    const subscriptions = await this.repo.getPushSubscriptions(userId);
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      data: notification.metadata,
    });

    await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys as webpush.PushSubscription['keys'] },
          payload,
        ),
      ),
    );
  }
}
