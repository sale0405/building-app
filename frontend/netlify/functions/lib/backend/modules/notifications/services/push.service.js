import webpush from 'web-push';
import { config } from '../../../config/modules.js';
export class PushService {
    repo;
    enabled = false;
    constructor(repo) {
        this.repo = repo;
        if (config.vapid.publicKey && config.vapid.privateKey) {
            webpush.setVapidDetails(config.vapid.subject, config.vapid.publicKey, config.vapid.privateKey);
            this.enabled = true;
        }
    }
    async sendToUser(userId, notification) {
        if (!this.enabled)
            return;
        const subscriptions = await this.repo.getPushSubscriptions(userId);
        const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            data: notification.metadata,
        });
        await Promise.allSettled(subscriptions.map((sub) => webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)));
    }
}
