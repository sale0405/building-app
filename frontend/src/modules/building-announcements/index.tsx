import { moduleRegistry } from '../../core/module-registry.js';
import { t } from '../../core/i18n/index.js';
import { BuildingAnnouncementsPage } from './pages/BuildingAnnouncementsPage.js';

export function registerBuildingAnnouncementsModule() {
  moduleRegistry.register({
    routes: [{ path: '/building-announcements', element: <BuildingAnnouncementsPage /> }],
    navItems: [{ label: t('nav.buildingAnnouncements'), path: '/building-announcements' }],
  });
}
