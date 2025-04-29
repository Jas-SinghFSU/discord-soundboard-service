import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EVENT_BUS } from './event.constants';
import { NestEventBus } from './nest.event-bus';

@Module({
    imports: [
        EventEmitterModule.forRoot({
            wildcard: false,
            delimiter: '.',
            maxListeners: 10,
            verboseMemoryLeak: true,
        }),
    ],
    providers: [
        {
            provide: EVENT_BUS,
            useClass: NestEventBus,
        },
    ],
    exports: [EVENT_BUS],
})
export class EventsModule {}
