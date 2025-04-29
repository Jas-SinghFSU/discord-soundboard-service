import { EventHandler, EventPayload } from './events.types';

export interface EventBus {
    /**
     * Publishes an event with the specified type and payload.
     *
     * @param eventType - The type or name of the event
     * @param payload - The data associated with the event
     */
    publish<T extends EventPayload>(eventType: string, payload: T): Promise<void>;

    /**
     * Subscribes to events of the specified type.
     *
     * @param eventType - The type or name of events to subscribe to
     * @param handler - The function to be called when events of this type are published
     */
    subscribe<T extends EventPayload>(eventType: string, handler: EventHandler<T>): void;
}
