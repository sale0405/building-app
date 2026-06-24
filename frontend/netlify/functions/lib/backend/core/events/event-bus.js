import { EventEmitter } from 'events';
class EventBus {
    emitter = new EventEmitter();
    emit(event, payload) {
        this.emitter.emit(event, payload);
    }
    on(event, listener) {
        this.emitter.on(event, listener);
    }
    off(event, listener) {
        this.emitter.off(event, listener);
    }
}
export const eventBus = new EventBus();
