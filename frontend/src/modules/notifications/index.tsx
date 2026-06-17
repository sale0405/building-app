import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { useNotificationsStore } from './store/notifications.store.js';

export function registerNotificationsModule() {
  moduleRegistry.register({
    routes: [{ path: '/notifications', element: <NotificationsPage /> }],
    navItems: [{ label: t('nav.notifications'), path: '/notifications' }],
    onRegister: () => {
      setTimeout(() => useNotificationsStore.getState().subscribeRealtime(), 1000);
    },
  });
}

