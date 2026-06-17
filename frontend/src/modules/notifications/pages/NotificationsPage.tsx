import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NotificationDto } from '@building-app/shared';
import { enumLabel, t } from '../../../core/i18n/index.js';
import { useAuthStore } from '../../auth/store/auth.store.js';
import { useNotificationsStore } from '../store/notifications.store.js';
import {
  canResolveNotification,
  formatCountdown,
  getNotificationPath,
  getResponseButtons,
  isNotificationActive,
} from '../utils/notification-ui.js';

function ValidityBadge({ notification }: { notification: NotificationDto }) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (notification.validityMode !== 'TIMED' || !notification.expiresAt) return;

    const tick = () => setCountdown(formatCountdown(notification.expiresAt!));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [notification.validityMode, notification.expiresAt]);

  if (notification.resolvedAt) {
    return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">{t('common.resolved')}</span>;
  }

  if (notification.validityMode === 'UNTIL_RESOLVED') {
    return (
      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800">
        {t('notifications.ongoing')}
      </span>
    );
  }

  if (notification.validityMode === 'TIMED' && notification.expiresAt) {
    const expired = !isNotificationActive(notification);
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded ${
          expired ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-800'
        }`}
      >
        {expired ? t('common.expired') : `${t('notifications.expiresIn')} ${countdown}`}
      </span>
    );
  }

  return null;
}

function NotificationCard({ notification }: { notification: NotificationDto }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { markRead, deleteNotification, respond, resolve } = useNotificationsStore();
  const buttons = getResponseButtons(notification);
  const path = getNotificationPath(notification);
  const active = isNotificationActive(notification);
  const showResolve = user && canResolveNotification(notification, user.userId);

  const handleResponse = async (action: string) => {
    if (action === 'VIEW' && path) {
      await respond(notification.id, action);
      navigate(path);
      return;
    }
    await respond(notification.id, action);
  };

  return (
    <div
      className={`card ${!notification.readAt ? 'border-primary/40 ring-1 ring-primary/20' : ''} ${
        !active ? 'opacity-75' : ''
      }`}
    >
      <div className="flex justify-between gap-3 items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{notification.title}</h3>
            <span className="text-xs text-gray-400 uppercase">{enumLabel(notification.type)}</span>
            <ValidityBadge notification={notification} />
          </div>
          <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString('hr-HR')}</p>
          {notification.userResponse && (
            <p className="text-xs text-primary mt-1">
              {t('notifications.yourResponse')}: {enumLabel(notification.userResponse)}
            </p>
          )}
        </div>
        <button
          type="button"
          className="text-xs text-red-600 hover:underline shrink-0"
          onClick={() => deleteNotification(notification.id)}
        >
          {t('common.delete')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {!notification.readAt && (
          <button type="button" className="btn-secondary text-xs" onClick={() => markRead(notification.id)}>
            {t('notifications.markRead')}
          </button>
        )}
        {buttons.map((button) => (
          <button
            key={`${button.action}-${button.label}`}
            type="button"
            className="btn-primary text-xs"
            disabled={!active || Boolean(notification.userResponse)}
            onClick={() => handleResponse(button.action)}
          >
            {button.label}
          </button>
        ))}
        {showResolve && (
          <button
            type="button"
            className="btn-secondary text-xs"
            onClick={() => resolve(notification.id)}
          >
            {t('notifications.markResolved')}
          </button>
        )}
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const {
    items,
    unreadCount,
    total,
    page,
    totalPages,
    loading,
    fetch,
    loadMore,
    markAllRead,
    createAnnouncement,
  } = useNotificationsStore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [validityMode, setValidityMode] = useState<'TIMED' | 'UNTIL_RESOLVED'>('TIMED');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload: {
      title: string;
      body: string;
      validityMode: 'TIMED' | 'UNTIL_RESOLVED';
      expiresAt?: string;
    } = { title, body, validityMode };

    if (validityMode === 'TIMED') {
      if (!expiresAt) {
        setError(t('notifications.expiresError'));
        setSubmitting(false);
        return;
      }
      payload.expiresAt = new Date(expiresAt).toISOString();
    }

    const ok = await createAnnouncement(payload);
    setSubmitting(false);

    if (ok) {
      setTitle('');
      setBody('');
      setExpiresAt('');
      setShowForm(false);
    } else {
      setError(t('notifications.postFailed'));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">
          {t('notifications.title')} {unreadCount > 0 && `(${unreadCount} ${t('notifications.unread')})`}
        </h1>
        <div className="flex gap-2">
          <button type="button" className="btn-primary text-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? t('common.cancel') : t('notifications.post')}
          </button>
          {unreadCount > 0 && (
            <button type="button" className="btn-secondary text-sm" onClick={markAllRead}>
              {t('notifications.markAllRead')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form className="card space-y-4 mb-6" onSubmit={handleCreate}>
          <h2 className="font-semibold">{t('notifications.postTitle')}</h2>
          <p className="text-sm text-gray-500">
            {t('notifications.postHint', { floor: user?.floor ? ` (${user.floor.label})` : '' })}
          </p>
          <input
            className="input"
            placeholder={t('common.title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input"
            rows={3}
            placeholder={t('notifications.messagePlaceholder')}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">{t('notifications.validity')}</label>
            <select
              className="input"
              value={validityMode}
              onChange={(e) => setValidityMode(e.target.value as 'TIMED' | 'UNTIL_RESOLVED')}
            >
              <option value="TIMED">{t('notifications.timed')}</option>
              <option value="UNTIL_RESOLVED">{t('notifications.untilResolved')}</option>
            </select>
          </div>
          {validityMode === 'TIMED' && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('notifications.expiresAt')}</label>
              <input
                className="input"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
              />
            </div>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? t('notifications.posting') : t('notifications.postToFloor')}
          </button>
        </form>
      )}

      <p className="text-sm text-gray-500 mb-4">
        {t('notifications.showing', { shown: items.length, total })}
      </p>

      {loading && items.length === 0 && <p className="text-gray-500">{t('notifications.loading')}</p>}
      {!loading && items.length === 0 && <p className="text-gray-500">{t('notifications.empty')}</p>}

      <div className="space-y-3">
        {items.map((n) => (
          <NotificationCard key={n.id} notification={n} />
        ))}
      </div>

      {page < totalPages && (
        <button type="button" className="btn-secondary mt-4 w-full" onClick={loadMore}>
          {t('common.loadMore')}
        </button>
      )}
    </div>
  );
}
