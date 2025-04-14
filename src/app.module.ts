import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { InteractorsModule } from './application/interactors/interactors.module';
import { ServicesModule } from './application/services/services.module';
import { ControllersModule } from './presentation/controllers/controller.module';
import { AuthModule } from './presentation/auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        DatabaseModule,
        InteractorsModule,
        ServicesModule,
        ControllersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
