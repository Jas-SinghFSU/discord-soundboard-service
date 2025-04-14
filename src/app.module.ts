import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { InteractorsModule } from './application/interactors/interactors.module';
import { ServicesModules } from './application/services/services.module';
import { ControllersModule } from './presentation/controllers/controller.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DatabaseModule,
        InteractorsModule,
        ServicesModules,
        ControllersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
