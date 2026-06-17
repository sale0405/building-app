import { useEffect, useState } from 'react';
import type { BusinessHelpRequestDto } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { enumLabel, t } from '../../../core/i18n/index.js';

export function BusinessHelpPage() {
  const [requests, setRequests] = useState<BusinessHelpRequestDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '', title: '', description: '' });

  const fetchRequests = () => {
    apiClient.get<BusinessHelpRequestDto[]>('/business-help/requests').then((res) => {
      if (res.success && res.data) setRequests(res.data);
    });
  };

  useEffect(() => { fetchRequests(); }, []);

  const createRequest = async () => {
    await apiClient.post('/business-help/requests', form);
    setShowForm(false);
    setForm({ category: '', title: '', description: '' });
    fetchRequests();
  };

  const updateStatus = async (id: string, status: string) => {
    await apiClient.patch(`/business-help/requests/${id}/status`, { status });
    fetchRequests();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('businessHelp.title')}</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t('common.cancel') : t('businessHelp.requestHelp')}
        </button>
      </div>
      {showForm && (
        <div className="card mb-6 space-y-3">
          <input className="input" placeholder={t('businessHelp.category')} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="input" placeholder={t('common.title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input" rows={3} placeholder={t('common.description')} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn-primary" onClick={createRequest}>{t('common.submit')}</button>
        </div>
      )}
      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="card">
            <div className="flex justify-between">
              <h3 className="font-medium">{r.title}</h3>
              <span className="text-xs px-2 py-1 rounded bg-gray-100">{enumLabel(r.status)}</span>
            </div>
            <p className="text-sm text-gray-500">{r.category}</p>
            <p className="text-sm mt-1">{r.description}</p>
            {r.status === 'MATCHED' && (
              <button className="btn-secondary text-sm mt-3" onClick={() => updateStatus(r.id, 'COMPLETED')}>{t('businessHelp.markComplete')}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
