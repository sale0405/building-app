import type { Express } from 'express';
import type { EventBus } from '../events/event-bus.js';
import type { StorageService } from '../storage/storage.interface.js';

export interface ModuleContext {
  eventBus: EventBus;
  storage: StorageService;
}

export type ModuleRegistrar = (app: Express, ctx: ModuleContext) => void;
