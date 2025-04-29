import { AudioFileFormat } from 'src/domain/entities/audio/audio.types';

export class PostgresAudioCommand {
    public id: string;
    public name: string;
    public format: AudioFileFormat;
    public size: number;
    public created_by: string;
    public created_at: Date;
    public updated_at: Date;
}
