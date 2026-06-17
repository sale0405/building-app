import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { BusinessHelpPage } from './pages/BusinessHelpPage.js';

export function registerBusinessHelpModule() {
  moduleRegistry.register({
    routes: [{ path: '/business-help', element: <BusinessHelpPage /> }],
    navItems: [{ label: t('nav.businessHelp'), path: '/business-help' }],
  });
}

