import { createAdminRoutes, createReportRoutes } from './routes/admin.routes.js';
export function registerModule(app, _ctx) {
    app.use('/api/v1/admin', createAdminRoutes());
    app.use('/api/v1', createReportRoutes());
}
