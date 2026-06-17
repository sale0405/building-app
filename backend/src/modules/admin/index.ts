import type { Express } from 'express';
import type { ModuleContext } from '../../core/types/module-context.js';
import { createAdminRoutes, createReportRoutes } from './routes/admin.routes.js';

export function registerModule(app: Express, _ctx: ModuleContext): void {
  app.use('/api/v1/admin', createAdminRoutes());
  app.use('/api/v1', createReportRoutes());
}
