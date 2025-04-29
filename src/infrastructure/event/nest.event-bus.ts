import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventBus } from 'src/domain/ports/events/event-bus.interface';
import { EventHandler, EventPayload } from 'src/domain/ports/events/events.types';

@Injectable()
export class NestEventBus implements EventBus {
    constructor(private readonly _eventEmitter: EventEmitter2) {}

    public async publish<T extends EventPayload>(eventType: string, payload: T): Promise<void> {
        this._eventEmitter.emit(eventType, payload);
    }

    public subscribe<T extends EventPayload>(eventType: string, handler: EventHandler<T>): void {
        this._eventEmitter.on(eventType, handler);
    }
}
