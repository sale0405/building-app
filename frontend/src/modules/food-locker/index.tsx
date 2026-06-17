import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { FoodLockerPage } from './pages/FoodLockerPage.js';

export function registerFoodLockerModule() {
  moduleRegistry.register({
    routes: [{ path: '/food-locker', element: <FoodLockerPage /> }],
    navItems: [{ label: t('nav.foodLocker'), path: '/food-locker' }],
  });
}

