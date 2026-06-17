import { useEffect, useState } from 'react';
import type { ChoreRequestDto, UserProfileDto } from '@building-app/shared';
import { CoopAudienceType, UrgencyLevel } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { enumLabel, t } from '../../../core/i18n/index.js';
import { useAuthStore } from '../../auth/store/auth.store.js';
import { canVolunteerForCoop, getCoopAudienceLabel, getCoopAudienceTypeLabel } from '../utils/coop-ui.js';

export function ChoresPage() {
  const user = useAuthStore((s) => s.user);
  const [chores, setChores] = useState<ChoreRequestDto[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [users, setUsers] = useState<UserProfileDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    helpType: '',
    estimatedDuration: 30,
    urgency: UrgencyLevel.MEDIUM,
    audienceType: CoopAudienceType.OPEN,
    targetCompanyName: '',
    targetUserId: '',
  });

  const fetchChores = () => {
    apiClient.get<ChoreRequestDto[]>('/chores/requests').then((res) => {
      if (res.success && res.data) setChores(res.data);
    });
  };

  useEffect(() => {
    fetchChores();
    apiClient.get<string[]>('/chores/companies').then((res) => {
      if (res.success && res.data) setCompanies(res.data);
    });
    apiClient.get<UserProfileDto[]>('/chat/users').then((res) => {
      if (res.success && res.data) setUsers(res.data.filter((u) => u.userId !== user?.userId));
    });
  }, [user?.userId]);

  const createChore = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      helpType: form.helpType,
      estimatedDuration: form.estimatedDuration,
      urgency: form.urgency,
      audienceType: form.audienceType,
      ...(form.audienceType === CoopAudienceType.OTHER_COMPANY
        ? { targetCompanyName: form.targetCompanyName }
        : {}),
      ...(form.audienceType === CoopAudienceType.SPECIFIC_USER
        ? { targetUserId: form.targetUserId }
        : {}),
    };

    const res = await apiClient.post('/chores/requests', payload);
    if (!res.success) return;

    setShowForm(false);
    setForm({
      title: '',
      description: '',
      helpType: '',
      estimatedDuration: 30,
      urgency: UrgencyLevel.MEDIUM,
      audienceType: CoopAudienceType.OPEN,
      targetCompanyName: '',
      targetUserId: '',
    });
    fetchChores();
  };

  const volunteer = async (id: string) => {
    await apiClient.post(`/chores/requests/${id}/volunteer`);
    fetchChores();
  };

  const updateStatus = async (id: string, status: string) => {
    await apiClient.patch(`/chores/requests/${id}/status`, { status });
    fetchChores();
  };

  const myCompany = user?.companyName?.trim() ?? '';
  const otherCompanies = companies.filter((company) => company !== myCompany);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('chores.title')}</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t('common.cancel') : t('chores.startCoop')}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">{t('chores.audience')}</label>
            <select
              className="input"
              value={form.audienceType}
              onChange={(e) =>
                setForm({
                  ...form,
                  audienceType: e.target.value as CoopAudienceType,
                  targetCompanyName: '',
                  targetUserId: '',
                })
              }
            >
              {Object.values(CoopAudienceType).map((value) => (
                <option key={value} value={value}>
                  {getCoopAudienceTypeLabel(value, t)}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t('chores.audienceHint')}</p>
          </div>

          {form.audienceType === CoopAudienceType.MY_COMPANY && !myCompany && (
            <p className="text-sm text-amber-700">{t('chores.companyRequired')}</p>
          )}

          {form.audienceType === CoopAudienceType.OTHER_COMPANY && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('chores.targetCompany')}</label>
              <select
                className="input"
                value={form.targetCompanyName}
                onChange={(e) => setForm({ ...form, targetCompanyName: e.target.value })}
              >
                <option value="">{t('chores.selectCompany')}</option>
                {otherCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.audienceType === CoopAudienceType.SPECIFIC_USER && (
            <div>
              <label className="block text-sm font-medium mb-1">{t('chores.targetUser')}</label>
              <select
                className="input"
                value={form.targetUserId}
                onChange={(e) => setForm({ ...form, targetUserId: e.target.value })}
              >
                <option value="">{t('chores.selectUser')}</option>
                {users.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name}
                    {u.companyName ? ` · ${u.companyName}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            className="input"
            placeholder={t('common.title')}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input"
            rows={3}
            placeholder={t('common.description')}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="input"
            placeholder={t('chores.typeOfHelp')}
            value={form.helpType}
            onChange={(e) => setForm({ ...form, helpType: e.target.value })}
          />
          <select
            className="input"
            value={form.urgency}
            onChange={(e) => setForm({ ...form, urgency: e.target.value as UrgencyLevel })}
          >
            {Object.values(UrgencyLevel).map((u) => (
              <option key={u} value={u}>
                {enumLabel(u)}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={createChore}>
            {t('chores.submitRequest')}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {chores.length === 0 && <p className="text-gray-500">{t('chores.empty')}</p>}
        {chores.map((c) => (
          <div key={c.id} className="card">
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-medium">{c.title}</h3>
                <p className="text-xs text-primary mt-1">{getCoopAudienceLabel(c, t)}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 h-fit">{enumLabel(c.status)}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{c.description}</p>
            <p className="text-xs text-gray-400 mt-2">
              {c.helpType} · {enumLabel(c.urgency)} · {c.requester?.name}
              {c.requester?.companyName ? ` · ${c.requester.companyName}` : ''}
            </p>
            <div className="flex gap-2 mt-3">
              {user && canVolunteerForCoop(c, user) && (
                <button className="btn-primary text-sm" onClick={() => volunteer(c.id)}>
                  {t('chores.volunteer')}
                </button>
              )}
              {(c.requesterId === user?.userId || c.volunteerId === user?.userId) &&
                c.status === 'ACCEPTED' && (
                  <button className="btn-secondary text-sm" onClick={() => updateStatus(c.id, 'IN_PROGRESS')}>
                    {t('chores.start')}
                  </button>
                )}
              {(c.requesterId === user?.userId || c.volunteerId === user?.userId) &&
                c.status === 'IN_PROGRESS' && (
                  <button className="btn-secondary text-sm" onClick={() => updateStatus(c.id, 'COMPLETED')}>
                    {t('chores.complete')}
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
