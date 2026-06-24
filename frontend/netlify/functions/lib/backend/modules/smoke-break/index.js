import { createSmokeBreakRoutes } from './routes/smoke-break.routes.js';
export function registerModule(app, _ctx) {
    app.use('/api/v1/smoke-break', createSmokeBreakRoutes());
}
