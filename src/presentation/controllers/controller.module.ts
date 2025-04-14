import { Module } from '@nestjs/common';
import { ServicesModule } from 'src/application/services/services.module';
import { UrlConfigService } from 'src/application/services/url.service';
import { AuthController } from './auth.controller';

@Module({
    imports: [ServicesModule],
    providers: [UrlConfigService],
    controllers: [AuthController],
})
export class ControllersModule {}
