import { useEffect, useState } from 'react';
import type { FoodListingDto } from '@building-app/shared';
import { apiClient } from '../../../core/api-client.js';
import { t } from '../../../core/i18n/index.js';
import { useAuthStore } from '../../auth/store/auth.store.js';

export function FoodLockerPage() {
  const [listings, setListings] = useState<FoodListingDto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const user = useAuthStore((s) => s.user);
  const [form, setForm] = useState({
    lockerNumber: '',
    title: '',
    quantity: 1,
    expirationDate: '',
    price: 0,
  });

  const fetchListings = () => {
    apiClient.get<FoodListingDto[]>('/food-locker/listings?status=AVAILABLE').then((res) => {
      if (res.success && res.data) setListings(res.data);
    });
  };

  useEffect(() => { fetchListings(); }, []);

  const createListing = async () => {
    if (!user?.floor) return;
    const fd = new FormData();
    fd.append('floorId', user.floor.id);
    fd.append('lockerNumber', form.lockerNumber);
    fd.append('title', form.title);
    fd.append('quantity', String(form.quantity));
    fd.append('expirationDate', new Date(form.expirationDate).toISOString());
    fd.append('price', String(form.price));
    await apiClient.post('/food-locker/listings', fd);
    setShowForm(false);
    fetchListings();
  };

  const reserve = async (id: string) => {
    await apiClient.post(`/food-locker/listings/${id}/reserve`);
    fetchListings();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('foodLocker.title')}</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t('common.cancel') : t('foodLocker.listFood')}
        </button>
      </div>
      {showForm && (
        <div className="card mb-6 space-y-3">
          <input className="input" placeholder={t('foodLocker.lockerNumber')} value={form.lockerNumber} onChange={(e) => setForm({ ...form, lockerNumber: e.target.value })} />
          <input className="input" placeholder={t('common.title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" type="number" placeholder={t('foodLocker.quantity')} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          <input className="input" type="date" value={form.expirationDate} onChange={(e) => setForm({ ...form, expirationDate: e.target.value })} />
          <input className="input" type="number" step="0.01" placeholder={t('foodLocker.price')} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <button className="btn-primary" onClick={createListing}>{t('foodLocker.createListing')}</button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <div key={l.id} className="card">
            <h3 className="font-medium">{l.title}</h3>
            <p className="text-sm text-gray-500">{t('foodLocker.locker')} {l.lockerNumber}</p>
            <p className="text-lg font-semibold mt-2">{l.price.toFixed(2)} €</p>
            <p className="text-xs text-gray-400">{t('foodLocker.qty')}: {l.quantity} · {t('foodLocker.exp')}: {new Date(l.expirationDate).toLocaleDateString('hr-HR')}</p>
            <button className="btn-primary text-sm mt-3 w-full" onClick={() => reserve(l.id)}>{t('foodLocker.reserve')}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
