import { AudioFileFormat } from 'src/domain/entities/audio/audio.types';

export class AudioResponseDto {
    id: string;
    name: string;
    format: AudioFileFormat;
    size: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
