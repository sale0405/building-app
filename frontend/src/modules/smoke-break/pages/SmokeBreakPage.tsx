import { useEffect, useState } from 'react';
import type { SmokeBreakInvitationDto } from '@building-app/shared';
import { BreakLocationType, BreakType } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { t } from '../../../core/i18n/index.js';
import { getSocket } from '../../../core/socket-client.js';
import { useAuthStore } from '../../auth/store/auth.store.js';

interface Floor {
  id: string;
  number: number;
  label: string;
}

const locationOptions = [
  { value: BreakLocationType.TERRACE, labelKey: 'breaks.terrace' },
  { value: BreakLocationType.KITCHEN, labelKey: 'breaks.kitchen' },
  { value: BreakLocationType.COFFEE_SHOP, labelKey: 'breaks.coffeeShop' },
] as const;

function breakTypeLabel(type: BreakType) {
  return type === BreakType.COFFEE ? t('breaks.coffee') : t('breaks.smoke');
}

function locationTypeShort(type: BreakLocationType) {
  switch (type) {
    case BreakLocationType.TERRACE:
      return t('breaks.locationTerraceShort');
    case BreakLocationType.KITCHEN:
      return t('breaks.locationKitchenShort');
    case BreakLocationType.COFFEE_SHOP:
      return t('breaks.locationCoffeeShopShort');
    default:
      return '';
  }
}

export function SmokeBreakPage() {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [invitations, setInvitations] = useState<SmokeBreakInvitationDto[]>([]);
  const [viewFloorId, setViewFloorId] = useState('');
  const [floorId, setFloorId] = useState('');
  const [breakType, setBreakType] = useState<BreakType>(BreakType.COFFEE);
  const [locationType, setLocationType] = useState<BreakLocationType>(BreakLocationType.TERRACE);
  const [duration, setDuration] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    apiClient.get<Floor[]>('/auth/floors', { skipAuth: true }).then((res) => {
      if (res.success && res.data) {
        setFloors(res.data);
        const defaultFloor = user?.floor?.id ?? res.data[0]?.id ?? '';
        setFloorId(defaultFloor);
        setViewFloorId(defaultFloor);
      }
    });
  }, [user?.floor?.id]);

  const fetchInvitations = () => {
    const query = viewFloorId ? `?floorId=${viewFloorId}` : '';
    apiClient.get<SmokeBreakInvitationDto[]>(`/smoke-break/invitations${query}`).then((res) => {
      if (res.success && res.data) setInvitations(res.data);
    });
  };

  useEffect(() => {
    if (viewFloorId) fetchInvitations();
  }, [viewFloorId]);

  useEffect(() => {
    const socket = getSocket();
    socket?.on('smoke-break:invitation', fetchInvitations);
    socket?.on('smoke-break:joined', fetchInvitations);
    return () => {
      socket?.off('smoke-break:invitation', fetchInvitations);
      socket?.off('smoke-break:joined', fetchInvitations);
    };
  }, [viewFloorId]);

  const createInvitation = async () => {
    if (!floorId) return;
    setSubmitting(true);
    await apiClient.post('/smoke-break/invitations', {
      floorId,
      breakType,
      locationType,
      durationMinutes: duration,
    });
    setSubmitting(false);
    fetchInvitations();
  };

  const join = async (id: string) => {
    await apiClient.post(`/smoke-break/invitations/${id}/join`);
    fetchInvitations();
  };

  const cancel = async (id: string) => {
    await apiClient.delete(`/smoke-break/invitations/${id}`);
    fetchInvitations();
  };

  const selectedFloorLabel = floors.find((f) => f.id === floorId)?.label ?? '';
  const viewFloorLabel = floors.find((f) => f.id === viewFloorId)?.label ?? '';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('breaks.title')}</h1>

      <div className="card mb-6 space-y-4">
        <h2 className="font-semibold">{t('breaks.askTitle')}</h2>

        <div>
          <label className="block text-sm font-medium mb-1">{t('breaks.breakType')}</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn text-sm ${breakType === BreakType.SMOKE ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setBreakType(BreakType.SMOKE)}
            >
              {t('breaks.smoke')}
            </button>
            <button
              type="button"
              className={`btn text-sm ${breakType === BreakType.COFFEE ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setBreakType(BreakType.COFFEE)}
            >
              {t('breaks.coffee')}
            </button>
          </div>
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
          <label className="block text-sm font-medium mb-1">{t('breaks.meetingSpot')}</label>
          <select
            className="input"
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as BreakLocationType)}
          >
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {locationType === BreakLocationType.COFFEE_SHOP
              ? t('breaks.coffeeShopHint')
              : locationType === BreakLocationType.TERRACE
                ? t('breaks.terraceHint', { floor: selectedFloorLabel })
                : t('breaks.kitchenHint', { floor: selectedFloorLabel })}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('common.duration')}</label>
          <select className="input w-full sm:w-40" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
            {[10, 15, 30, 45, 60].map((d) => (
              <option key={d} value={d}>
                {d} {t('common.min')}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="btn-primary" onClick={createInvitation} disabled={!floorId || submitting}>
          {submitting ? t('breaks.posting') : t('breaks.postInvite')}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="font-semibold">{t('breaks.activeTitle')}</h2>
        <select className="input w-44 text-sm" value={viewFloorId} onChange={(e) => setViewFloorId(e.target.value)}>
          {floors.map((floor) => (
            <option key={floor.id} value={floor.id}>
              {t('breaks.viewFloor')} {floor.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-gray-500 mb-3">{t('breaks.listHint', { floor: viewFloorLabel })}</p>

      <div className="space-y-3">
        {invitations.length === 0 && <p className="text-gray-500">{t('breaks.noInvitations')}</p>}
        {invitations.map((inv) => (
          <div key={inv.id} className="card flex flex-wrap justify-between items-center gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{inv.location}</p>
                <span className="text-xs px-2 py-0.5 rounded bg-white/60">{breakTypeLabel(inv.breakType)}</span>
              </div>
              <p className="text-sm text-gray-500">
                {locationTypeShort(inv.locationType)} · {inv.creator?.name} · {inv.durationMinutes} {t('common.min')} ·{' '}
                {inv.participants?.length ?? 0} {t('breaks.joined')}
              </p>
            </div>
            <div className="flex gap-2">
              {inv.creatorId === user?.userId ? (
                <button type="button" className="btn-secondary text-sm" onClick={() => cancel(inv.id)}>
                  {t('common.cancel')}
                </button>
              ) : (
                <button type="button" className="btn-primary text-sm" onClick={() => join(inv.id)}>
                  {t('common.join')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
