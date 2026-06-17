import type { Express } from 'express';
import type { ModuleContext } from '../../core/types/module-context.js';
import { createFoodLockerRoutes } from './routes/food-locker.routes.js';
import { eventBus } from '../../core/events/event-bus.js';
import { FoodLockerService, FoodLockerRepository } from './services/food-locker.service.js';

export function registerModule(app: Express, ctx: ModuleContext): void {
  app.use('/api/v1/food-locker', createFoodLockerRoutes(ctx.storage));

  eventBus.on('admin.listing.removed', async ({ listingId }) => {
    const service = new FoodLockerService(new FoodLockerRepository(), (key) => ctx.storage.getUrl(key));
    await service.removeListing(listingId);
  });
}
