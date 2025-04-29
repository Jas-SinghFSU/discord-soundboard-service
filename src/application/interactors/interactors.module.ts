import { Module } from '@nestjs/common';
import { CreateUserInteractor, GetUserInteractor, UpdateUserInteractor } from './user';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { GetAudioInteractor } from './audio/get-audio.interactor';
import { CreateAudioInteractor } from './audio/create-audio.interactor';

@Module({
    imports: [DatabaseModule],
    providers: [
        GetUserInteractor,
        UpdateUserInteractor,
        CreateUserInteractor,

        GetAudioInteractor,
        CreateAudioInteractor,
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
