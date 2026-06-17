import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { ChoresPage } from './pages/ChoresPage.js';

export function registerChoresModule() {
  moduleRegistry.register({
    routes: [{ path: '/chores', element: <ChoresPage /> }],
    navItems: [{ label: t('nav.chores'), path: '/chores' }],
  });
}

