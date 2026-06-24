import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '@building-app/shared';
import { isApiConfigured } from '../../../config/modules.js';
import { useAuthStore } from '../store/auth.store.js';
import { t } from '../../../core/i18n/index.js';

export function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    role: UserRole.BUSINESS_USER,
  });
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(form);
    if (!ok) return;

    const user = useAuthStore.getState().user;
    navigate(user && !user.profileComplete ? '/profile' : '/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">{t('auth.register')}</h1>
        {import.meta.env.PROD && !isApiConfigured && (
          <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {t('auth.apiNotConfigured')}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" placeholder={t('common.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" type="email" placeholder={t('common.email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" type="password" placeholder={t('auth.passwordHint')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
            <option value={UserRole.RESIDENT}>{t('auth.roleResident')}</option>
            <option value={UserRole.BUSINESS_USER}>{t('auth.roleBusiness')}</option>
          </select>
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? t('auth.creatingAccount') : t('auth.register')}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">{t('auth.registerHint')}</p>
        <p className="mt-2 text-sm text-gray-600 text-center">
          {t('auth.haveAccount')} <Link to="/login" className="text-primary hover:underline">{t('auth.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
