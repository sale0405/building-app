import { createBuildingAnnouncementsRoutes } from './routes/building-announcements.routes.js';
export function registerModule(app, _ctx) {
    app.use('/api/v1/building-announcements', createBuildingAnnouncementsRoutes());
}
