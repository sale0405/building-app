import type { Express } from 'express';
import type { ModuleContext } from '../../core/types/module-context.js';
import { createSmokeBreakRoutes } from './routes/smoke-break.routes.js';

export function registerModule(app: Express, _ctx: ModuleContext): void {
  app.use('/api/v1/smoke-break', createSmokeBreakRoutes());
}
