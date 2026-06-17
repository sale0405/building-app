import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store.js';
import { t } from '../../../core/i18n/index.js';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (!ok) return;

    const user = useAuthStore.getState().user;
    navigate(user && !user.profileComplete ? '/profile' : '/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">{t('auth.signIn')}</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.email')}</label>
            <input className="input" type="email" placeholder={t('common.email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('common.password')}</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          {t('auth.noAccount')} <Link to="/register" className="text-primary hover:underline">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  );
}
