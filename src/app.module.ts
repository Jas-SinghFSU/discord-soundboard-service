import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { InteractorsModule } from './application/interactors/interactors.module';
import { ServicesModule } from './application/services/services.module';
import { AuthModule } from './presentation/auth/auth.module';
import { ControllersModule } from './presentation/controllers/controller.module';
import appConfig from './config/app.config';
import { EventsModule } from './infrastructure/event/event.module';
import { DiscordModule } from './infrastructure/adapters/discord/discord.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
        AuthModule,
        DatabaseModule,
        InteractorsModule,
        ServicesModule,
        EventsModule,
        DiscordModule,
        ControllersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
