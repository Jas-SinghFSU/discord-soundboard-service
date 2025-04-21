import { Module, Provider } from '@nestjs/common';
import { CreateUserInteractor, GetUserInteractor, UpdateUserInteractor } from './user';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';
import { DatabaseFactory } from 'src/infrastructure/database/database.factory';
import { UserRepository } from 'src/domain/ports/repositories';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { GetAudioInteractor } from './audio/get-audio.interactor';
import { CreateAudioInteractor } from './audio/create-audio.interactor';

const USER_REPOSITORY_PROVIDER: Provider = {
    provide: RepositoryTokens.USER,
    useFactory: (databaseFactory: DatabaseFactory): UserRepository => {
        return databaseFactory.getUserRepository();
    },
    inject: [DatabaseFactory],
};

const AUDIO_REPOSITORY_PROVIDER: Provider = {
    provide: RepositoryTokens.AUDIO,
    useFactory: (databaseFactory: DatabaseFactory): AudioRepository => {
        return databaseFactory.getAudioRepository();
    },
    inject: [DatabaseFactory],
};

@Module({
    imports: [DatabaseModule],
    providers: [
        GetUserInteractor,
        UpdateUserInteractor,
        CreateUserInteractor,

        GetAudioInteractor,
        CreateAudioInteractor,

        USER_REPOSITORY_PROVIDER,
        AUDIO_REPOSITORY_PROVIDER,
    ],
    exports: [
        GetUserInteractor,
        UpdateUserInteractor,
        CreateUserInteractor,
        GetAudioInteractor,
        CreateAudioInteractor,
    ],
})
export class InteractorsModule {}
