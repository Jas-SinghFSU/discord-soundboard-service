import { Module, Provider } from '@nestjs/common';
import { InteractorsModule } from '../interactors/interactors.module';
import { AuthService } from './auth.service';
import { CreateUserInteractor, GetUserInteractor, UpdateUserInteractor } from '../interactors/user';
import { AudioService } from './audio.service';
import { GetAudioInteractor } from '../interactors/audio/get-audio.interactor';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

const AUTH_SERVICE_PROVIDER: Provider = {
    provide: AuthService,
    useFactory: (
        createUserInteractor: CreateUserInteractor,
        updateUserInteractor: UpdateUserInteractor,
        getUserInteractor: GetUserInteractor,
    ): AuthService => new AuthService(createUserInteractor, updateUserInteractor, getUserInteractor),
    inject: [CreateUserInteractor, UpdateUserInteractor, GetUserInteractor],
};

const AUDIO_SERVICE_PROVIDER: Provider = {
    provide: AudioService,
    useFactory: (getAudioInteractor: GetAudioInteractor): AudioService =>
        new AudioService(getAudioInteractor),
    inject: [GetAudioInteractor],
};

@Module({
    imports: [InteractorsModule, DatabaseModule],
    providers: [AUTH_SERVICE_PROVIDER, AUDIO_SERVICE_PROVIDER],
    exports: [AuthService, AudioService],
})
export class ServicesModule {}
