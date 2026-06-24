import { createBusinessHelpRoutes } from './routes/business-help.routes.js';
export function registerModule(app, _ctx) {
    app.use('/api/v1/business-help', createBusinessHelpRoutes());
}
