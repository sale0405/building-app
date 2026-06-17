import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { SmokeBreakPage } from './pages/SmokeBreakPage.js';

export function registerSmokeBreakModule() {
  moduleRegistry.register({
    routes: [{ path: '/smoke-break', element: <SmokeBreakPage /> }],
    navItems: [{ label: t('nav.breaks'), path: '/smoke-break' }],
  });
}

