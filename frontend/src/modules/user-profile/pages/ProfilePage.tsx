import { useEffect, useState } from 'react';
import { AvailabilityStatus } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { enumLabel, t } from '../../../core/i18n/index.js';
import { useAuthStore } from '../../auth/store/auth.store.js';

interface Floor {
  id: string;
  number: number;
  label: string;
}

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const loadUser = useAuthStore((s) => s.loadUser);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [companyName, setCompanyName] = useState(user?.companyName ?? '');
  const [officeNumber, setOfficeNumber] = useState(user?.officeNumber ?? '');
  const [floorId, setFloorId] = useState(user?.floor?.id ?? '');
  const [status, setStatus] = useState(user?.availabilityStatus ?? AvailabilityStatus.AVAILABLE);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get<Floor[]>('/auth/floors', { skipAuth: true }).then((res) => {
      if (res.success && res.data) setFloors(res.data);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio ?? '');
    setCompanyName(user.companyName ?? '');
    setOfficeNumber(user.officeNumber ?? '');
    setFloorId(user.floor?.id ?? '');
    setStatus(user.availabilityStatus);
  }, [user]);

  const handleSave = async () => {
    if (!floorId) {
      setError(t('profile.selectFloorError'));
      return;
    }
    if (!officeNumber.trim()) {
      setError(t('profile.officeError'));
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    const res = await apiClient.patch('/users/me', {
      name,
      bio,
      companyName: companyName.trim(),
      officeNumber: officeNumber.trim(),
      floorId,
      availabilityStatus: status,
    });

    if (res.success) {
      await loadUser();
      setMessage(user?.profileComplete ? t('profile.updated') : t('profile.created'));
    } else {
      setError(res.error || t('profile.saveFailed'));
    }

    setSaving(false);
  };

  if (!user) return null;

  const isNewProfile = !user.profileComplete;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">{isNewProfile ? t('profile.createTitle') : t('profile.myTitle')}</h1>
      {isNewProfile && <p className="text-sm text-gray-600 mb-6">{t('profile.createHint')}</p>}

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('common.name')}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('common.floor')}</label>
          <select className="input" value={floorId} onChange={(e) => setFloorId(e.target.value)} required>
            <option value="">{t('common.selectFloor')}</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('common.companyName')}</label>
          <input
            className="input"
            placeholder={t('profile.companyPlaceholder')}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('common.officeNumber')}</label>
          <input
            className="input"
            placeholder={t('profile.officePlaceholder')}
            value={officeNumber}
            onChange={(e) => setOfficeNumber(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('common.bio')}</label>
          <textarea className="input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('common.availability')}</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as AvailabilityStatus)}>
            {Object.values(AvailabilityStatus).map((s) => (
              <option key={s} value={s}>{enumLabel(s)}</option>
            ))}
          </select>
        </div>

        <p className="text-sm text-gray-500">{user.email}</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? t('profile.saving') : isNewProfile ? t('profile.createProfile') : t('profile.saveProfile')}
        </button>
      </div>
    </div>
  );
}
