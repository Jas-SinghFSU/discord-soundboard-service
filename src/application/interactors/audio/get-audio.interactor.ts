import { Inject, Injectable } from '@nestjs/common';
import { Interactor } from '../interactor.interface';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';

@Injectable()
export class GetAudioInteractor implements Interactor<string, Audio | undefined> {
    constructor(
        @Inject(RepositoryTokens.AUDIO)
        private readonly _audioRepository: AudioRepository,
    ) {}

    public async execute(id: string): Promise<Audio | undefined> {
        const audio = await this._audioRepository.findOneById(id);

        return audio;
    }
}
