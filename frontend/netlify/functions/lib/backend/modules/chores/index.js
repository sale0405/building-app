import { createChoresRoutes } from './routes/chores.routes.js';
export function registerModule(app, _ctx) {
    app.use('/api/v1/chores', createChoresRoutes());
}
