import { Module, Provider } from '@nestjs/common';
import { InteractorsModule } from '../interactors/interactors.module';
import { AuthService } from './auth.service';
import { CreateUserInteractor, GetUserInteractor, UpdateUserInteractor } from '../interactors/user';
import { AudioService } from './audio.service';
import { GetAudioInteractor } from '../interactors/audio/get-audio.interactor';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { CreateAudioInteractor } from '../interactors/audio/create-audio.interactor';
import { EVENT_BUS } from 'src/infrastructure/event/event.constants';
import { EventBus } from 'src/domain/ports/events/event-bus.interface';
import { EventsModule } from 'src/infrastructure/event/event.module';

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
    useFactory: (
        getAudioInteractor: GetAudioInteractor,
        createAudioInteractor: CreateAudioInteractor,
        eventBus: EventBus,
    ): AudioService => new AudioService(getAudioInteractor, createAudioInteractor, eventBus),
    inject: [GetAudioInteractor, CreateAudioInteractor, EVENT_BUS],
};

@Module({
    imports: [InteractorsModule, DatabaseModule, EventsModule],
    providers: [AUTH_SERVICE_PROVIDER, AUDIO_SERVICE_PROVIDER],
    exports: [AuthService, AudioService],
})
export class ServicesModule {}
