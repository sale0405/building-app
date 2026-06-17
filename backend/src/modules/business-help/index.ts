import type { Express } from 'express';
import type { ModuleContext } from '../../core/types/module-context.js';
import { createBusinessHelpRoutes } from './routes/business-help.routes.js';

export function registerModule(app: Express, _ctx: ModuleContext): void {
  app.use('/api/v1/business-help', createBusinessHelpRoutes());
}
