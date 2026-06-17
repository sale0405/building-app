import { useEffect, useState } from 'react';
import type { AdminAnalyticsDto, UserProfileDto } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { enumLabel, formatUserLocation, t } from '../../../core/i18n/index.js';

export function AdminPage() {
  const [analytics, setAnalytics] = useState<AdminAnalyticsDto | null>(null);
  const [users, setUsers] = useState<UserProfileDto[]>([]);

  useEffect(() => {
    apiClient.get<AdminAnalyticsDto>('/admin/analytics').then((res) => {
      if (res.success && res.data) setAnalytics(res.data);
    });
    apiClient.get<UserProfileDto[]>('/admin/users').then((res) => {
      if (res.success && res.data) setUsers(res.data);
    });
  }, []);

  const disableUser = async (id: string) => {
    await apiClient.post(`/admin/users/${id}/disable`, { reason: 'Admin action' });
    const res = await apiClient.get<UserProfileDto[]>('/admin/users');
    if (res.success && res.data) setUsers(res.data);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.title')}</h1>
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center"><p className="text-2xl font-bold">{analytics.totalUsers}</p><p className="text-sm text-gray-500">{t('admin.users')}</p></div>
          <div className="card text-center"><p className="text-2xl font-bold">{analytics.activeListings}</p><p className="text-sm text-gray-500">{t('admin.listings')}</p></div>
          <div className="card text-center"><p className="text-2xl font-bold">{analytics.openChores}</p><p className="text-sm text-gray-500">{t('admin.openChores')}</p></div>
          <div className="card text-center"><p className="text-2xl font-bold">{analytics.messagesLast24h}</p><p className="text-sm text-gray-500">{t('admin.messages24h')}</p></div>
        </div>
      )}
      <h2 className="font-semibold mb-3">{t('admin.usersByFloor')}</h2>
      {analytics?.usersByFloor.map((f) => (
        <p key={f.floorId} className="text-sm text-gray-600">{f.floorLabel}: {t('admin.usersCount', { count: f.count })}</p>
      ))}
      <h2 className="font-semibold mt-6 mb-3">{t('admin.manageUsers')}</h2>
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.userId} className="card flex justify-between items-center">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-500">
                {u.email}
                {u.floor ? ` · ${formatUserLocation(u.floor.label, u.officeNumber)}` : ` · ${t('common.noFloor')}`}
                {` · ${enumLabel(u.role)}`}
              </p>
            </div>
            {u.role !== 'BUILDING_ADMIN' && (
              <button className="btn-secondary text-sm text-red-600" onClick={() => disableUser(u.userId)}>{t('admin.disable')}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
