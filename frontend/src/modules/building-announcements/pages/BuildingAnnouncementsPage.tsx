import { useEffect, useState } from 'react';
import type { BuildingAnnouncementDto } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { t } from '../../../core/i18n/index.js';
import { useAuthStore } from '../../auth/store/auth.store.js';

export function BuildingAnnouncementsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'BUILDING_ADMIN';
  const [items, setItems] = useState<BuildingAnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = () => {
    setLoading(true);
    apiClient.get<BuildingAnnouncementDto[]>('/building-announcements').then((res) => {
      if (res.success && res.data) setItems(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload: { title: string; body: string; expiresAt?: string } = { title, body };
    if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();

    const res = await apiClient.post<BuildingAnnouncementDto>('/building-announcements', payload);
    setSubmitting(false);

    if (res.success) {
      setTitle('');
      setBody('');
      setExpiresAt('');
      setShowForm(false);
      fetchItems();
    } else {
      setError(res.error || t('buildingAnnouncements.postFailed'));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await apiClient.delete(`/building-announcements/${id}`);
    if (res.success) fetchItems();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('buildingAnnouncements.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">{t('buildingAnnouncements.subtitle')}</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn-primary text-sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? t('common.cancel') : t('buildingAnnouncements.post')}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <form className="card space-y-4 mb-6" onSubmit={handleCreate}>
          <h2 className="font-semibold">{t('buildingAnnouncements.postTitle')}</h2>
          <p className="text-sm text-gray-500">{t('buildingAnnouncements.postHint')}</p>
          <input
            className="input"
            placeholder={t('common.title')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="input"
            rows={5}
            placeholder={t('buildingAnnouncements.messagePlaceholder')}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">{t('buildingAnnouncements.expiresAt')}</label>
            <input
              className="input"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">{t('buildingAnnouncements.expiresHint')}</p>
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? t('buildingAnnouncements.posting') : t('buildingAnnouncements.publish')}
          </button>
        </form>
      )}

      {!isAdmin && (
        <p className="text-sm text-gray-500 mb-4">{t('buildingAnnouncements.readOnlyHint')}</p>
      )}

      {loading && <p className="text-gray-500">{t('common.loading')}</p>}
      {!loading && items.length === 0 && (
        <p className="text-gray-500">{t('buildingAnnouncements.empty')}</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="card">
            <div className="flex justify-between gap-3 items-start">
              <div>
                <h2 className="font-semibold text-lg">{item.title}</h2>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.createdAt).toLocaleString('hr-HR')}
                  {item.author ? ` · ${item.author.name}` : ''}
                  {item.expiresAt
                    ? ` · ${t('buildingAnnouncements.expires')} ${new Date(item.expiresAt).toLocaleString('hr-HR')}`
                    : ''}
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline shrink-0"
                  onClick={() => handleDelete(item.id)}
                >
                  {t('common.delete')}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
