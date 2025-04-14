import { Module } from '@nestjs/common';
import { ServicesModule } from 'src/application/services/services.module';
import { AuthController } from './auth.controller';
import { UrlConfigService } from 'src/config/services/url.service';

@Module({
    imports: [ServicesModule],
    providers: [UrlConfigService],
    controllers: [AuthController],
})
export class ControllersModule {}
