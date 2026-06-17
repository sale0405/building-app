import type { Express } from 'express';
import type { ModuleContext } from '../../core/types/module-context.js';
import { createAuthRoutes } from './routes/auth.routes.js';

export function registerModule(app: Express, _ctx: ModuleContext): void {
  app.use('/api/v1/auth', createAuthRoutes());
}
