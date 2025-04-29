export type EventPayload = Record<string, unknown>;

export interface EventHandler<T extends EventPayload> {
    (payload: T): Promise<void>;
}
