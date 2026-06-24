import { createUsersRoutes } from './routes/users.routes.js';
import { eventBus } from '../../core/events/event-bus.js';
export function registerModule(app, ctx) {
    app.use('/api/v1/users', createUsersRoutes(ctx.storage));
    eventBus.on('user.registered', async ({ userId, email, role, floorId }) => {
        console.log(`User registered: ${email} (${role}) on floor ${floorId}, id: ${userId}`);
    });
}
