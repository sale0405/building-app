import { Link, Outlet, useLocation } from 'react-router-dom';
import { formatOffice, t } from './i18n/index.js';
import { useAuthStore } from '../modules/auth/store/auth.store.js';
import { moduleRegistry } from './module-registry.js';
import { useNotificationsStore } from '../modules/notifications/store/notifications.store.js';

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const unread = useNotificationsStore((s) => s.unreadCount);
  const navItems = moduleRegistry.getNavItems(user?.role === 'BUILDING_ADMIN');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b border-white/30 text-gray-900 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            {t('app.name')}
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm hidden sm:inline">
                {user.name}
                {user.floor && user.officeNumber && (
                  <span className="hidden sm:inline">
                    {' '}
                    · {user.floor.label} · {formatOffice(user.officeNumber)}
                  </span>
                )}
              </span>
            )}
            <Link to="/notifications" className="relative text-sm text-gray-800 hover:underline">
              {t('nav.notifications')}
              {unread > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Link>
            <button onClick={() => logout()} className="text-sm text-gray-800 hover:underline">
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        <nav className="app-shell w-56 shrink-0 border-r border-white/20 p-4 hidden md:block">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <nav className="app-shell md:hidden fixed bottom-0 left-0 right-0 border-t border-white/20 flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-xs px-2 py-1 ${
              location.pathname.startsWith(item.path) ? 'text-primary font-medium' : 'text-gray-600'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
