import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { AdminPage } from './pages/AdminPage.js';

export function registerAdminModule() {
  moduleRegistry.register({
    routes: [{ path: '/admin', element: <AdminPage /> }],
    navItems: [{ label: t('nav.admin'), path: '/admin', adminOnly: true }],
  });
}

