import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordAudioAdapter } from './discord-audio.adapter';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { EventsModule } from 'src/infrastructure/event/event.module';

@Module({
    imports: [ConfigModule, DatabaseModule, EventsModule],
    providers: [DiscordAudioAdapter],
    exports: [DiscordAudioAdapter],
})
export class DiscordModule {}
