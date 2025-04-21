import { Module } from '@nestjs/common';
import { ServicesModule } from 'src/application/services/services.module';
import { UrlConfigService } from 'src/application/services/url.service';
import { AuthController } from './auth.controller';
import { AudioController } from './audio.controller';
import { AudioConrollerMapper } from '../mappers/audio.mapper';

@Module({
    imports: [ServicesModule],
    providers: [UrlConfigService, AudioConrollerMapper],
    controllers: [AuthController, AudioController],
})
export class ControllersModule {}
