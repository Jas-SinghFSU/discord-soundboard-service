import { AudioFileFormat } from 'src/domain/entities/audio/audio.types';

export class PostgresAudioCommand {
    public id: string;
    public name: string;
    public format: AudioFileFormat;
    public size: number;
    public createdBy: string;
    public createdAt: Date;
    public updatedAt: Date;
}
