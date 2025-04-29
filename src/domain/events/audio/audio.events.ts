import { EventPayload } from 'src/domain/ports/events/events.types';

export interface AudioPlayRequestedPayload extends EventPayload {
    audioId: string;
    volume: number;
    channelId: string;
    userId: string;
    timestamp: Date;
}

export interface AudioPlayFinishedPayload extends EventPayload {
    audioId: string;
    volume: number;
    channelId: string;
    userId: string;
    duration: number;
    timestamp: Date;
}
