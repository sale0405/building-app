import { EventEmitter } from 'events';
import type { DomainEventMap, DomainEventName } from '@building-app/shared';

class EventBus {
  private emitter = new EventEmitter();

  emit<T extends DomainEventName>(event: T, payload: DomainEventMap[T]): void {
    this.emitter.emit(event, payload);
  }

  on<T extends DomainEventName>(
    event: T,
    listener: (payload: DomainEventMap[T]) => void | Promise<void>,
  ): void {
    this.emitter.on(event, listener);
  }

  off<T extends DomainEventName>(
    event: T,
    listener: (payload: DomainEventMap[T]) => void | Promise<void>,
  ): void {
    this.emitter.off(event, listener);
  }
}

export const eventBus = new EventBus();
export type { EventBus };
