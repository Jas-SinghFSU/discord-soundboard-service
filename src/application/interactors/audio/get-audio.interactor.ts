import { Injectable } from '@nestjs/common';
import { Interactor } from '../interactor.interface';
import { Audio } from 'src/domain/entities/audio/audio.entity';

@Injectable()
export class GetAudioInteractor implements Interactor<string, Audio | undefined> {
    constructor(private readonly _audioRepository: AudioRepository) {}

    public async execute(id: string): Promise<Audio | undefined> {
        const audio = await this._audioRepository.findById(id);

        return audio;
    }
}
