import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { ProfilePage } from './pages/ProfilePage.js';

export function registerUserProfileModule() {
  moduleRegistry.register({
    routes: [{ path: '/profile', element: <ProfilePage /> }],
    navItems: [{ label: t('nav.profile'), path: '/profile' }],
  });
}

