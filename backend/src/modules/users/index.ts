import type { Express } from 'express';
import type { ModuleContext } from '../../core/types/module-context.js';
import { createUsersRoutes } from './routes/users.routes.js';
import { eventBus } from '../../core/events/event-bus.js';

export function registerModule(app: Express, ctx: ModuleContext): void {
  app.use('/api/v1/users', createUsersRoutes(ctx.storage));

  eventBus.on('user.registered', async ({ userId, email, role, floorId }) => {
    console.log(`User registered: ${email} (${role}) on floor ${floorId}, id: ${userId}`);
  });
}
