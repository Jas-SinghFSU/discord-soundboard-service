import { Module } from '@nestjs/common';
import { ServicesModules } from 'src/application/services/services.module';
import { AuthController } from './auth.controller';
import { UrlConfigService } from 'src/config/services/url.service';

@Module({
    imports: [ServicesModules],
    providers: [UrlConfigService],
    controllers: [AuthController],
})
export class ControllersModule {}
