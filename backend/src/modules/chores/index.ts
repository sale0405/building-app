import type { Express } from 'express';
import type { ModuleContext } from '../../core/types/module-context.js';
import { createChoresRoutes } from './routes/chores.routes.js';

export function registerModule(app: Express, _ctx: ModuleContext): void {
  app.use('/api/v1/chores', createChoresRoutes());
}
