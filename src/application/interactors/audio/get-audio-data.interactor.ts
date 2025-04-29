import { Inject, Injectable } from '@nestjs/common';
import { Interactor } from '../interactor.interface';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';
import { AudioFileData } from 'src/domain/entities/audio/audio.types';

@Injectable()
export class GetAudioDataInteractor implements Interactor<string, AudioFileData | undefined> {
    constructor(
        @Inject(RepositoryTokens.AUDIO)
        private readonly _audioRepository: AudioRepository,
    ) {}

    public async execute(id: string): Promise<AudioFileData | undefined> {
        const audio = await this._audioRepository.findDataById(id);

        return audio;
    }
}
