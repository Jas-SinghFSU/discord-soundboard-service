import { CreateAudioProps } from 'src/domain/entities/audio/audio.types';

export interface CreateAudioCommand {
    audioProps: Pick<CreateAudioProps, 'name' | 'format'>;
    audioFile: Buffer;
}
