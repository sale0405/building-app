import { createAuthRoutes } from './routes/auth.routes.js';
export function registerModule(app, _ctx) {
    app.use('/api/v1/auth', createAuthRoutes());
}
