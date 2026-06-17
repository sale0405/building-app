import type { Express } from 'express';
import type { Server as HttpServer } from 'http';
import type { ModuleName } from '@building-app/shared';
import { enabledModules } from '../config/modules.js';
import type { ModuleContext, ModuleRegistrar } from './types/module-context.js';

export type { ModuleContext, ModuleRegistrar };

const moduleLoaders: Record<ModuleName, () => Promise<{ registerModule: ModuleRegistrar }>> = {
  auth: () => import('../modules/auth/index.js'),
  users: () => import('../modules/users/index.js'),
  notifications: () => import('../modules/notifications/index.js'),
  chat: () => import('../modules/chat/index.js'),
  'smoke-break': () => import('../modules/smoke-break/index.js'),
  chores: () => import('../modules/chores/index.js'),
  'food-locker': () => import('../modules/food-locker/index.js'),
  'building-announcements': () => import('../modules/building-announcements/index.js'),
  admin: () => import('../modules/admin/index.js'),
};

export async function registerModules(
  app: Express,
  ctx: ModuleContext,
  _httpServer: HttpServer,
): Promise<void> {
  for (const name of enabledModules) {
    const loader = moduleLoaders[name];
    if (!loader) continue;
    const mod = await loader();
    mod.registerModule(app, ctx);
    console.log(`Registered module: ${name}`);
  }
}
