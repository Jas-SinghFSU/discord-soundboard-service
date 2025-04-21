import { CreateAudioProps } from 'src/domain/entities/audio/audio.types';

export interface CreateAudioCommand {
    audioProps: CreateAudioProps;
    audioFile: Buffer;
}
